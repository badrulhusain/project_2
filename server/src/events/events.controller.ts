import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { CreateEventDto, FoodItemDto, UpdateEventDto } from './dto.js';
import { EventsService } from './events.service.js';
@ApiTags('events') @Controller('events') export class EventsController {
  constructor(private events: EventsService) {}
  @Post() @Protected(Role.ADMIN) create(@Body() dto: CreateEventDto, @Req() req: { user: AuthUser }) { return this.events.create(dto, req.user.id); }
  @Patch(':id') @Protected(Role.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto, @Req() req: { user: AuthUser }) { return this.events.update(id, dto, req.user.id); }
  @Post(':id/publish') @Protected(Role.ADMIN) publish(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.events.publish(id, req.user.id); }
  @Get() list(@Query('page', new ParseIntPipe({ optional: true })) page = 1, @Query('limit', new ParseIntPipe({ optional: true })) limit = 20) { return this.events.list(Math.max(1, page), Math.min(100, Math.max(1, limit))); }
  @Get(':id') detail(@Param('id', ParseUUIDPipe) id: string) { return this.events.detail(id); }
  @Post(':id/food-items') @Protected(Role.ADMIN) addFood(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FoodItemDto, @Req() req: { user: AuthUser }) { return this.events.addFood(id, req.user.id, dto); }
  @Get(':id/food-items') food(@Param('id', ParseUUIDPipe) id: string) { return this.events.config(id, 'foodItem'); }
  @Delete(':id/food-items/:childId') @Protected(Role.ADMIN) delFood(@Param('id', ParseUUIDPipe) id: string, @Param('childId', ParseUUIDPipe) childId: string, @Req() req: { user: AuthUser }) { return this.events.remove(id, childId, req.user.id, 'foodItem'); }
}
@ApiTags('events') @Controller('admin/events') export class AdminEventsController {
  constructor(private events: EventsService) {}
  @Get() @Protected(Role.ADMIN) list(@Req() req: { user: AuthUser }) { return this.events.adminList(req.user.id); }
}
