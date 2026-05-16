import { Test, TestingModule } from '@nestjs/testing';
import { IntentsService } from './intents.service';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';

const mockPrisma = {
  intent: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockQueue = { add: jest.fn().mockResolvedValue({}) };

describe('IntentsService', () => {
  let service: IntentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('intents'), useValue: mockQueue },
      ],
    }).compile();
    service = module.get<IntentsService>(IntentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('persists the intent and enqueues a job', async () => {
      const created = {
        id: 'intent-1',
        tenantId: 'tenant-1',
        fromChain: 'stellar',
        toChain: 'solana',
        amount: '10',
        asset: 'XLM',
        recipient: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
        status: 'pending',
        txHash: null,
        error: null,
        createdAt: new Date(),
      };
      mockPrisma.intent.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', {
        fromChain: 'stellar',
        toChain: 'solana',
        amount: '10',
        asset: 'XLM',
        recipient: created.recipient,
      });

      expect(mockPrisma.intent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId: 'tenant-1', status: 'pending' }),
      });
      expect(mockQueue.add).toHaveBeenCalledWith('process', {
        intentId: 'intent-1',
        tenantId: 'tenant-1',
      });
      expect(result.id).toBe('intent-1');
    });
  });

  describe('findById', () => {
    it('returns the intent when found', async () => {
      const intent = { id: 'intent-1', status: 'pending' };
      mockPrisma.intent.findUnique.mockResolvedValue(intent);
      expect(await service.findById('intent-1')).toEqual(intent);
    });

    it('returns null when not found', async () => {
      mockPrisma.intent.findUnique.mockResolvedValue(null);
      expect(await service.findById('missing')).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('updates status and txHash', async () => {
      mockPrisma.intent.update.mockResolvedValue({});
      await service.updateStatus('intent-1', 'completed', 'tx-abc');
      expect(mockPrisma.intent.update).toHaveBeenCalledWith({
        where: { id: 'intent-1' },
        data: { status: 'completed', txHash: 'tx-abc', error: undefined },
      });
    });
  });

  describe('findByTenant', () => {
    it('returns intents ordered by createdAt desc', async () => {
      const intents = [{ id: 'a' }, { id: 'b' }];
      mockPrisma.intent.findMany.mockResolvedValue(intents);
      const result = await service.findByTenant('tenant-1');
      expect(mockPrisma.intent.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(intents);
    });
  });
});
