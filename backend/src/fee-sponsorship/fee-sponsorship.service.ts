import { Injectable, Logger } from '@nestjs/common';

export type SponsorshipQuota = {
  tenantId: string;
  usedXlm: number;
  limitXlm: number;
  remaining: number;
};

@Injectable()
export class FeeSponsorshipService {
  private readonly logger = new Logger(FeeSponsorshipService.name);

  /**
   * Checks whether a tenant has remaining fee sponsorship quota.
   * TODO: persist quota usage to database.
   */
  async checkQuota(tenantId: string): Promise<SponsorshipQuota> {
    this.logger.log(`Checking quota for tenant ${tenantId}`);
    // Stub: return a default quota
    return { tenantId, usedXlm: 0, limitXlm: 100, remaining: 100 };
  }

  /**
   * Deducts fee from tenant quota after a sponsored transaction.
   * TODO: implement atomic deduction with abuse protection.
   */
  async deductFee(tenantId: string, feeXlm: number): Promise<void> {
    this.logger.log(`Deducting ${feeXlm} XLM from tenant ${tenantId}`);
  }
}
