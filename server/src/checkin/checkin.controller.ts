import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { CheckinService } from './checkin.service.js';
import { CollectDto, ScanDto } from './dto.js';
@ApiTags('checkin') @Controller() export class CheckinController {
  constructor(private checkin: CheckinService) {}
  @Post('checkin') @Protected(Role.ADMIN) scan(@Body() dto: ScanDto, @Req() req: { user: AuthUser }) { return this.checkin.scan(dto.qrToken, req.user.id); }
  @Post('food-collect') @Protected(Role.ADMIN) collect(@Body() dto: CollectDto, @Req() req: { user: AuthUser }) { return this.checkin.collect(dto, req.user.id); }
}
