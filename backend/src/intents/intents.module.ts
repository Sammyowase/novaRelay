import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntentsController } from './intents.controller';
import { IntentsService } from './intents.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'intents',
    }),
  ],
  controllers: [IntentsController],
  providers: [IntentsService],
  exports: [IntentsService],
})
export class IntentsModule {}
