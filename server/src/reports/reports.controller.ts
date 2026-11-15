import { Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthUser, Protected } from '../common/auth.js';
import { ReportsService } from './reports.service.js';
@ApiTags('reports') @Controller('events/:id') export class ReportsController {
  constructor(private reports: ReportsService) {}
  @Post('close') @Protected(Role.ADMIN) close(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.reports.close(id, req.user.id); }
  @Get('report') @Protected(Role.ADMIN) report(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.reports.report(id, req.user.id); }
}
@ApiTags('reports') @Controller('admin/savings') export class SavingsController {
  constructor(private reports: ReportsService) {}
  @Get() @Protected(Role.ADMIN) savings(@Req() req: { user: AuthUser }) { return this.reports.savings(req.user.id); }
}
