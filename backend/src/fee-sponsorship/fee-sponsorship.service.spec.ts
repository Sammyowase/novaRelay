import { Test, TestingModule } from '@nestjs/testing';
import { FeeSponsorshipService } from './fee-sponsorship.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('stellar-sdk', () => ({
  SorobanRpc: { Server: jest.fn().mockImplementation(() => ({})), Api: { GetTransactionStatus: { SUCCESS: 'SUCCESS', NOT_FOUND: 'NOT_FOUND' } } },
  Networks: { TESTNET: 'Test SDF Network ; September 2015' },
  BASE_FEE: '100',
  Keypair: { fromSecret: jest.fn() },
  TransactionBuilder: jest.fn(),
  Contract: jest.fn(),
  Address: { fromString: jest.fn() },
  nativeToScVal: jest.fn(),
}));

const mockPrisma = {
  tenant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('FeeSponsorshipService', () => {
  let service: FeeSponsorshipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeSponsorshipService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<FeeSponsorshipService>(FeeSponsorshipService);
    jest.clearAllMocks();
    // Ensure Soroban path is skipped in unit tests (no contract ID set)
    delete process.env.FEE_SPONSORSHIP_CONTRACT_ID;
  });

  describe('checkQuota', () => {
    it('returns quota for a known tenant', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        quotaUsedXlm: 10,
        quotaLimitXlm: 100,
      });

      const quota = await service.checkQuota('tenant-1');
      expect(quota.remaining).toBe(90);
      expect(quota.usedXlm).toBe(10);
    });

    it('throws when tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.checkQuota('unknown')).rejects.toThrow('Tenant not found');
    });
  });

  describe('deductFee', () => {
    it('increments quotaUsedXlm in DB', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        quotaUsedXlm: 10,
        quotaLimitXlm: 100,
        stellarRelayer: null,
      });
      mockPrisma.tenant.update.mockResolvedValue({});

      await service.deductFee('tenant-1', 5);

      expect(mockPrisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-1' },
        data: { quotaUsedXlm: { increment: 5 } },
      });
    });

    it('throws when quota would be exceeded', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        quotaUsedXlm: 98,
        quotaLimitXlm: 100,
        stellarRelayer: null,
      });

      await expect(service.deductFee('tenant-1', 5)).rejects.toThrow('Quota exceeded');
      expect(mockPrisma.tenant.update).not.toHaveBeenCalled();
    });
  });
});
