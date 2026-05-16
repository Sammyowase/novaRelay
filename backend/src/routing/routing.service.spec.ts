import { Test, TestingModule } from '@nestjs/testing';
import { RoutingService } from './routing.service';
import { Intent } from '../intents/intents.service';

const baseIntent: Intent = {
  id: 'i1',
  tenantId: 't1',
  fromChain: 'stellar',
  toChain: 'solana',
  amount: '10',
  asset: 'XLM',
  recipient: 'addr',
  status: 'pending',
  createdAt: new Date(),
};

describe('RoutingService', () => {
  let service: RoutingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoutingService],
    }).compile();
    service = module.get<RoutingService>(RoutingService);
  });

  it('routes to stellar when toChain is stellar', () => {
    const route = service.selectRoute({ ...baseIntent, toChain: 'stellar' });
    expect(route.chain).toBe('stellar');
    expect(parseFloat(route.estimatedFee)).toBeGreaterThan(0);
  });

  it('routes to solana when toChain is solana', () => {
    const route = service.selectRoute({ ...baseIntent, toChain: 'solana' });
    expect(route.chain).toBe('solana');
  });

  it('solana fee is cheaper than stellar fee', () => {
    const stellar = service.selectRoute({ ...baseIntent, toChain: 'stellar' });
    const solana = service.selectRoute({ ...baseIntent, toChain: 'solana' });
    expect(parseFloat(solana.estimatedFee)).toBeLessThan(parseFloat(stellar.estimatedFee));
  });

  it('availableRoutes returns all chains sorted cheapest first', () => {
    const routes = service.availableRoutes(baseIntent);
    expect(routes.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < routes.length; i++) {
      expect(parseFloat(routes[i].estimatedFee)).toBeGreaterThanOrEqual(
        parseFloat(routes[i - 1].estimatedFee),
      );
    }
  });
});
