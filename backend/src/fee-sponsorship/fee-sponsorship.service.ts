import { Injectable, Logger } from '@nestjs/common';
import {
  SorobanRpc,
  TransactionBuilder,
  Contract,
  Address,
  nativeToScVal,
  Networks,
  BASE_FEE,
  Keypair,
} from 'stellar-sdk';
import { PrismaService } from '../prisma/prisma.service';

export type SponsorshipQuota = {
  tenantId: string;
  usedXlm: number;
  limitXlm: number;
  remaining: number;
};

const STROOPS_PER_XLM = 10_000_000;

@Injectable()
export class FeeSponsorshipService {
  private readonly logger = new Logger(FeeSponsorshipService.name);
  private readonly sorobanRpc: SorobanRpc.Server;
  private readonly contractId: string | undefined;
  private readonly relayerKeypair: Keypair | undefined;
  private readonly networkPassphrase: string;

  constructor(private prisma: PrismaService) {
    this.sorobanRpc = new SorobanRpc.Server(
      process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    );
    this.contractId = process.env.FEE_SPONSORSHIP_CONTRACT_ID;
    this.networkPassphrase =
      process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

    if (process.env.STELLAR_RELAYER_SECRET) {
      this.relayerKeypair = Keypair.fromSecret(process.env.STELLAR_RELAYER_SECRET);
    }
  }

  async checkQuota(tenantId: string): Promise<SponsorshipQuota> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Tenant not found');

    return {
      tenantId,
      usedXlm: tenant.quotaUsedXlm,
      limitXlm: tenant.quotaLimitXlm,
      remaining: tenant.quotaLimitXlm - tenant.quotaUsedXlm,
    };
  }

  async deductFee(tenantId: string, feeXlm: number): Promise<void> {
    const quota = await this.checkQuota(tenantId);
    if (quota.remaining < feeXlm) throw new Error('Quota exceeded');

    if (this.contractId && this.relayerKeypair) {
      await this.callSorobanDeductFee(tenantId, feeXlm);
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { quotaUsedXlm: { increment: feeXlm } },
    });

    this.logger.log(`Deducted ${feeXlm} XLM from tenant ${tenantId}`);
  }

  private async callSorobanDeductFee(tenantId: string, feeXlm: number): Promise<void> {
    const feeStroops = Math.round(feeXlm * STROOPS_PER_XLM);
    const relayerAddress = this.relayerKeypair!.publicKey();

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const tenantStellarAddress = tenant?.stellarRelayer ?? relayerAddress;

    const contract = new Contract(this.contractId!);
    const account = await this.sorobanRpc.getAccount(relayerAddress);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'deduct_fee',
          Address.fromString(relayerAddress).toScVal(),
          Address.fromString(tenantStellarAddress).toScVal(),
          nativeToScVal(feeStroops, { type: 'i128' }),
        ),
      )
      .setTimeout(30)
      .build();

    const prepared = await this.sorobanRpc.prepareTransaction(tx);
    prepared.sign(this.relayerKeypair!);

    const response = await this.sorobanRpc.sendTransaction(prepared);
    if (response.status === 'ERROR') {
      throw new Error(`Soroban deduct_fee failed: ${JSON.stringify(response.errorResult)}`);
    }

    let result = await this.sorobanRpc.getTransaction(response.hash);
    let attempts = 0;
    while (
      result.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
      attempts < 10
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      result = await this.sorobanRpc.getTransaction(response.hash);
      attempts++;
    }

    if (result.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Soroban deduct_fee did not confirm: ${result.status}`);
    }

    this.logger.log(`Soroban deduct_fee confirmed for tenant ${tenantId}: ${feeStroops} stroops`);
  }
}
