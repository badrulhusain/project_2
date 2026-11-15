import { Controller, Get, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { PlannerService } from './planner.service.js';
@ApiTags('planner') @Controller('events/:id/planner') export class PlannerController {
  constructor(private planner: PlannerService) {}
  @Get() @Protected(Role.ORGANIZER, Role.ADMIN) get(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.planner.generate(id, req.user.id); }
}
