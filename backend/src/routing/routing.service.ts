import { Injectable, Logger } from '@nestjs/common';
import { Intent } from '../intents/intents.service';

export type Route = {
  chain: 'stellar' | 'solana';
  estimatedFee: string;
  estimatedTimeMs: number;
};

// Static fee/latency estimates per chain (replace with oracle calls when available)
const CHAIN_PROFILES: Record<string, { feeXlm: number; timeMs: number }> = {
  stellar: { feeXlm: 0.00001, timeMs: 5000 },
  solana: { feeXlm: 0.000005, timeMs: 2000 },
};

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);

  selectRoute(intent: Intent): Route {
    // If the destination chain is explicitly set, honour it.
    // Otherwise pick the cheapest route that supports the asset.
    const target = intent.toChain;

    if (target === 'stellar' || target === 'solana') {
      const profile = CHAIN_PROFILES[target];
      this.logger.log(
        `Route selected: ${target} (fee=${profile.feeXlm} XLM, ~${profile.timeMs}ms)`,
      );
      return {
        chain: target,
        estimatedFee: profile.feeXlm.toString(),
        estimatedTimeMs: profile.timeMs,
      };
    }

    // Fallback: pick cheapest available chain
    const cheapest = (Object.entries(CHAIN_PROFILES) as [string, { feeXlm: number; timeMs: number }][])
      .sort(([, a], [, b]) => a.feeXlm - b.feeXlm)[0];

    this.logger.log(`Cheapest route selected: ${cheapest[0]}`);
    return {
      chain: cheapest[0] as 'stellar' | 'solana',
      estimatedFee: cheapest[1].feeXlm.toString(),
      estimatedTimeMs: cheapest[1].timeMs,
    };
  }

  /** Returns all available routes ranked by fee (cheapest first). */
  availableRoutes(intent: Intent): Route[] {
    return (Object.entries(CHAIN_PROFILES) as [string, { feeXlm: number; timeMs: number }][])
      .sort(([, a], [, b]) => a.feeXlm - b.feeXlm)
      .map(([chain, profile]) => ({
        chain: chain as 'stellar' | 'solana',
        estimatedFee: profile.feeXlm.toString(),
        estimatedTimeMs: profile.timeMs,
      }));
  }
}
