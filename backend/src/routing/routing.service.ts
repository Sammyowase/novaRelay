import { Injectable, Logger } from '@nestjs/common';
import { Intent } from '../intents/intents.service';

export type Route = {
  chain: 'stellar' | 'solana';
  estimatedFee: string;
  estimatedTimeMs: number;
};

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  /**
   * Selects the optimal execution route for an intent.
   * TODO: implement real fee + latency comparison across chains.
   */
  selectRoute(intent: Intent): Route {
    this.logger.log(`Selecting route for intent ${intent.id}`);
    // Stub: always route to the destination chain directly
    return {
      chain: intent.toChain,
      estimatedFee: '0.00001',
      estimatedTimeMs: 500,
    };
  }
}
