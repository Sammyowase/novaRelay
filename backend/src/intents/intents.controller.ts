import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IntentsService } from './intents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('intents')
@UseGuards(JwtAuthGuard)
export class IntentsController {
  constructor(private readonly intentsService: IntentsService) {}

  @Post()
  create(@CurrentUser() user: { userId: string; tenantId: string }, @Body() dto: any) {
    return this.intentsService.create(user.tenantId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.intentsService.findById(id);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: string; tenantId: string }) {
    return this.intentsService.findByTenant(user.tenantId);
  }
}
