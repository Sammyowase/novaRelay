import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntentsModule } from './intents/intents.module';
import { RoutingModule } from './routing/routing.module';
import { RelayerModule } from './relayer/relayer.module';
import { FeeSponsorshipModule } from './fee-sponsorship/fee-sponsorship.module';

@Module({
  imports: [IntentsModule, RoutingModule, RelayerModule, FeeSponsorshipModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
