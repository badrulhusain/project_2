import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { NotificationDto } from './dto.js';
import { NotificationsService } from './notifications.service.js';
@ApiTags('notifications') @Controller('events/:id/notifications') export class NotificationsController {
  constructor(private notifications: NotificationsService) {}
  @Post() @Protected(Role.ORGANIZER, Role.ADMIN) create(@Param('id', ParseUUIDPipe) id: string, @Body() dto: NotificationDto, @Req() req: { user: AuthUser }) { return this.notifications.create(id, req.user.id, dto); }
  @Get() @Protected() list(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.notifications.list(id, req.user.id); }
}
