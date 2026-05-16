import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IntentsModule } from './intents/intents.module';
import { RoutingModule } from './routing/routing.module';
import { RelayerModule } from './relayer/relayer.module';
import { FeeSponsorshipModule } from './fee-sponsorship/fee-sponsorship.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    IntentsModule,
    RoutingModule,
    RelayerModule,
    FeeSponsorshipModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
