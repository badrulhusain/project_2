import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser, Protected } from '../common/auth.js';
import { FoodOrderDto } from './dto.js';
import { FoodService } from './food.service.js';
@ApiTags('food') @Controller('bookings/:id/food-order') export class FoodController {
  constructor(private food: FoodService) {}
  @Put() @Protected() order(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FoodOrderDto, @Req() req: { user: AuthUser }) { return this.food.order(id, req.user.id, dto); }
  @Get() @Protected() get(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.food.get(id, req.user.id); }
}
