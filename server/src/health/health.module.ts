import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
@ApiTags('health') @Controller('health') class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async health() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok' }; }
}
@Module({ controllers: [HealthController] }) export class HealthModule {}
