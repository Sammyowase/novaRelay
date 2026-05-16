import { Test, TestingModule } from '@nestjs/testing';
import { IntentProcessor } from './intent.processor';
import { IntentsService } from '../intents/intents.service';
import { FeeSponsorshipService } from '../fee-sponsorship/fee-sponsorship.service';
import { RoutingService } from '../routing/routing.service';

// Mock heavy blockchain deps so Jest doesn't try to parse ESM packages
jest.mock('../relayer/relayer.service');
jest.mock('@solana/web3.js', () => ({ Connection: jest.fn(), Keypair: { fromSecretKey: jest.fn() }, PublicKey: jest.fn(), SystemProgram: { transfer: jest.fn() }, Transaction: jest.fn() }));
jest.mock('bs58', () => ({ decode: jest.fn() }));
jest.mock('stellar-sdk', () => ({ SorobanRpc: { Server: jest.fn(), Api: {} }, Networks: {}, BASE_FEE: '100', Keypair: { fromSecret: jest.fn() }, TransactionBuilder: jest.fn(), Contract: jest.fn(), Address: { fromString: jest.fn() }, nativeToScVal: jest.fn() }));

import { RelayerService } from '../relayer/relayer.service';

const pendingIntent = {
  id: 'intent-1',
  tenantId: 'tenant-1',
  fromChain: 'stellar' as const,
  toChain: 'solana' as const,
  amount: '10',
  asset: 'XLM',
  recipient: 'addr',
  status: 'pending' as const,
  createdAt: new Date(),
};

const mockIntentsService = {
  findById: jest.fn(),
  updateStatus: jest.fn().mockResolvedValue({}),
};
const mockRelayerService = { relay: jest.fn() };
const mockFeeSponsorshipService = {
  checkQuota: jest.fn(),
  deductFee: jest.fn().mockResolvedValue(undefined),
};
const mockRoutingService = {
  selectRoute: jest.fn().mockReturnValue({
    chain: 'solana',
    estimatedFee: '0.000005',
    estimatedTimeMs: 2000,
  }),
};

describe('IntentProcessor', () => {
  let processor: IntentProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentProcessor,
        { provide: IntentsService, useValue: mockIntentsService },
        { provide: RelayerService, useValue: mockRelayerService },
        { provide: FeeSponsorshipService, useValue: mockFeeSponsorshipService },
        { provide: RoutingService, useValue: mockRoutingService },
      ],
    }).compile();
    processor = module.get<IntentProcessor>(IntentProcessor);
    jest.clearAllMocks();
    // Re-apply default mock return values after clearAllMocks
    mockIntentsService.updateStatus.mockResolvedValue({});
    mockFeeSponsorshipService.deductFee.mockResolvedValue(undefined);
    mockRoutingService.selectRoute.mockReturnValue({
      chain: 'solana',
      estimatedFee: '0.000005',
      estimatedTimeMs: 2000,
    });
  });

  it('completes a successful intent end-to-end', async () => {
    mockIntentsService.findById.mockResolvedValue(pendingIntent);
    mockFeeSponsorshipService.checkQuota.mockResolvedValue({ remaining: 50 });
    mockRelayerService.relay.mockResolvedValue({ success: true, txHash: 'tx-abc' });

    await processor.process({ data: { intentId: 'intent-1', tenantId: 'tenant-1' } } as any);

    expect(mockIntentsService.updateStatus).toHaveBeenCalledWith('intent-1', 'routing');
    expect(mockIntentsService.updateStatus).toHaveBeenCalledWith('intent-1', 'executing');
    expect(mockIntentsService.updateStatus).toHaveBeenCalledWith('intent-1', 'completed', 'tx-abc');
    expect(mockFeeSponsorshipService.deductFee).toHaveBeenCalledWith('tenant-1', 0.000005);
  });

  it('marks intent failed when relay fails', async () => {
    mockIntentsService.findById.mockResolvedValue(pendingIntent);
    mockFeeSponsorshipService.checkQuota.mockResolvedValue({ remaining: 50 });
    mockRelayerService.relay.mockResolvedValue({ success: false, error: 'network error' });

    await processor.process({ data: { intentId: 'intent-1', tenantId: 'tenant-1' } } as any);

    expect(mockIntentsService.updateStatus).toHaveBeenCalledWith(
      'intent-1', 'failed', undefined, 'network error',
    );
    expect(mockFeeSponsorshipService.deductFee).not.toHaveBeenCalled();
  });

  it('marks intent failed and rethrows when quota is exhausted', async () => {
    mockIntentsService.findById.mockResolvedValue(pendingIntent);
    mockFeeSponsorshipService.checkQuota.mockResolvedValue({ remaining: 0 });

    await expect(
      processor.process({ data: { intentId: 'intent-1', tenantId: 'tenant-1' } } as any),
    ).rejects.toThrow();

    expect(mockIntentsService.updateStatus).toHaveBeenCalledWith(
      'intent-1', 'failed', undefined, 'Quota exceeded',
    );
    expect(mockRelayerService.relay).not.toHaveBeenCalled();
  });

  it('throws when intent not found', async () => {
    mockIntentsService.findById.mockResolvedValue(null);

    await expect(
      processor.process({ data: { intentId: 'missing', tenantId: 'tenant-1' } } as any),
    ).rejects.toThrow('Intent not found');
  });
});
