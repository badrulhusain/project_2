import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module.js';
import { ParkingController } from './parking.controller.js';
import { ParkingService } from './parking.service.js';
@Module({ imports: [EventsModule], controllers: [ParkingController], providers: [ParkingService] }) export class ParkingModule {}
