import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IntentsService } from '../intents/intents.service';
import { RelayerService } from '../relayer/relayer.service';
import { FeeSponsorshipService } from '../fee-sponsorship/fee-sponsorship.service';
import { RoutingService } from '../routing/routing.service';

@Processor('intents')
export class IntentProcessor extends WorkerHost {
  private readonly logger = new Logger(IntentProcessor.name);

  constructor(
    private intentsService: IntentsService,
    private relayerService: RelayerService,
    private feeSponsorshipService: FeeSponsorshipService,
    private routingService: RoutingService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { intentId, tenantId } = job.data;
    this.logger.log(`Processing intent ${intentId}`);

    try {
      const intent = await this.intentsService.findById(intentId);
      if (!intent) {
        throw new Error('Intent not found');
      }

      await this.intentsService.updateStatus(intentId, 'routing');
      const route = this.routingService.selectRoute(intent);
      this.logger.log(`Selected route: ${route.chain}`);

      await this.intentsService.updateStatus(intentId, 'executing');
      
      const quota = await this.feeSponsorshipService.checkQuota(tenantId);
      if (quota.remaining <= 0) {
        throw new Error('Quota exceeded');
      }

      const result = await this.relayerService.relay(intent);

      if (result.success) {
        await this.intentsService.updateStatus(intentId, 'completed', result.txHash || undefined);
        await this.feeSponsorshipService.deductFee(tenantId, parseFloat(route.estimatedFee));
        this.logger.log(`Intent ${intentId} completed: ${result.txHash}`);
      } else {
        await this.intentsService.updateStatus(intentId, 'failed', undefined, result.error);
        this.logger.error(`Intent ${intentId} failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(`Intent ${intentId} processing error: ${error.message}`);
      await this.intentsService.updateStatus(intentId, 'failed', undefined, error.message);
      throw error;
    }
  }
}
