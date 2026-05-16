import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntentProcessor } from './intent.processor';
import { IntentsModule } from '../intents/intents.module';
import { RelayerModule } from '../relayer/relayer.module';
import { FeeSponsorshipModule } from '../fee-sponsorship/fee-sponsorship.module';
import { RoutingModule } from '../routing/routing.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'intents',
    }),
    IntentsModule,
    RelayerModule,
    FeeSponsorshipModule,
    RoutingModule,
  ],
  providers: [IntentProcessor],
  exports: [BullModule],
})
export class QueueModule {}
