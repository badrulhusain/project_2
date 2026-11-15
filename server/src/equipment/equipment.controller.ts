import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { EquipmentDto } from './dto.js';
import { EquipmentService } from './equipment.service.js';
@ApiTags('equipment') @Controller('events/:id/equipment') export class EquipmentController {
  constructor(private equipment: EquipmentService) {}
  @Post() @Protected(Role.ORGANIZER, Role.ADMIN) add(@Param('id', ParseUUIDPipe) id: string, @Body() dto: EquipmentDto, @Req() req: { user: AuthUser }) { return this.equipment.add(id, req.user.id, dto); }
  @Patch(':childId') @Protected(Role.ORGANIZER, Role.ADMIN) update(@Param('id', ParseUUIDPipe) id: string, @Param('childId', ParseUUIDPipe) childId: string, @Body() dto: EquipmentDto, @Req() req: { user: AuthUser }) { return this.equipment.update(id, childId, req.user.id, dto); }
  @Get() list(@Param('id', ParseUUIDPipe) id: string) { return this.equipment.list(id); }
  @Delete(':childId') @Protected(Role.ORGANIZER, Role.ADMIN) remove(@Param('id', ParseUUIDPipe) id: string, @Param('childId', ParseUUIDPipe) childId: string, @Req() req: { user: AuthUser }) { return this.equipment.remove(id, childId, req.user.id); }
}
