import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module.js';
import { PlannerModule } from '../planner/planner.module.js';
import { CalibrationModule } from '../calibration/calibration.module.js';
import { ReportsController, SavingsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
@Module({ imports: [EventsModule, PlannerModule, CalibrationModule], controllers: [ReportsController, SavingsController], providers: [ReportsService] }) export class ReportsModule {}
