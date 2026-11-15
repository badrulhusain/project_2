import { Module } from '@nestjs/common';
import { PlannerController } from './planner.controller.js';
import { PlannerService } from './planner.service.js';
import { EventsModule } from '../events/events.module.js';
@Module({ imports: [EventsModule], controllers: [PlannerController], providers: [PlannerService], exports: [PlannerService] }) export class PlannerModule {}
