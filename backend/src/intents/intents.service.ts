import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

export interface Intent {
  id: string;
  tenantId: string;
  fromChain: 'stellar' | 'solana';
  toChain: 'stellar' | 'solana';
  amount: string;
  asset: string;
  recipient: string;
  status: 'pending' | 'routing' | 'executing' | 'completed' | 'failed';
  txHash?: string | null;
  error?: string | null;
  createdAt: Date;
}

@Injectable()
export class IntentsService {
  private readonly logger = new Logger(IntentsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('intents') private intentQueue: Queue,
  ) {}

  async create(tenantId: string, dto: Omit<Intent, 'id' | 'status' | 'createdAt' | 'tenantId' | 'txHash' | 'error'>): Promise<Intent> {
    const intent = await this.prisma.intent.create({
      data: {
        tenantId,
        fromChain: dto.fromChain,
        toChain: dto.toChain,
        amount: dto.amount,
        asset: dto.asset,
        recipient: dto.recipient,
        status: 'pending',
      },
    });
    
    await this.intentQueue.add('process', { intentId: intent.id, tenantId });
    this.logger.log(`Intent created and queued: ${intent.id}`);
    
    return intent as Intent;
  }

  async findById(id: string): Promise<Intent | null> {
    const intent = await this.prisma.intent.findUnique({ where: { id } });
    return intent as Intent | null;
  }

  async updateStatus(id: string, status: Intent['status'], txHash?: string, error?: string) {
    return this.prisma.intent.update({
      where: { id },
      data: { status, txHash, error },
    });
  }

  async findByTenant(tenantId: string, limit = 50) {
    return this.prisma.intent.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
