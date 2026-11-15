import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { ParkingZoneDto } from './dto.js';
import { ParkingService } from './parking.service.js';
@ApiTags('parking') @Controller('events/:id/parking-zones') export class ParkingController {
  constructor(private parking: ParkingService) {}
  @Post() @Protected(Role.ORGANIZER, Role.ADMIN) add(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ParkingZoneDto, @Req() req: { user: AuthUser }) { return this.parking.add(id, req.user.id, dto); }
  @Patch(':childId') @Protected(Role.ORGANIZER, Role.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Param('childId', ParseUUIDPipe) childId: string, @Body() dto: ParkingZoneDto, @Req() req: { user: AuthUser }) { return this.parking.update(id, childId, req.user.id, dto); }
  @Get() list(@Param('id', ParseUUIDPipe) id: string) { return this.parking.list(id); }
  @Delete(':childId') @Protected(Role.ORGANIZER, Role.ADMIN) remove(@Param('id', ParseUUIDPipe) id: string, @Param('childId', ParseUUIDPipe) childId: string, @Req() req: { user: AuthUser }) { return this.parking.remove(id, childId, req.user.id); }
}
