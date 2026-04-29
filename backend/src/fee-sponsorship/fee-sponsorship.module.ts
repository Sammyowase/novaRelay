import { Module } from '@nestjs/common';
import { FeeSponsorshipService } from './fee-sponsorship.service';

@Module({
  providers: [FeeSponsorshipService],
  exports: [FeeSponsorshipService],
})
export class FeeSponsorshipModule {}
