import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module.js';
import { EquipmentController } from './equipment.controller.js';
import { EquipmentService } from './equipment.service.js';
@Module({ imports: [EventsModule], controllers: [EquipmentController], providers: [EquipmentService] }) export class EquipmentModule {}
