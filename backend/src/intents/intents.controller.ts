import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IntentsService } from './intents.service';

@Controller('intents')
export class IntentsController {
  constructor(private readonly intentsService: IntentsService) {}

  @Post()
  create(@Body() body: Parameters<IntentsService['create']>[0]) {
    return this.intentsService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.intentsService.findById(id);
  }
}
