import { Module } from '@nestjs/common';
import { EventsController, AdminEventsController } from './events.controller.js';
import { EventsService } from './events.service.js';
@Module({ controllers: [EventsController, AdminEventsController], providers: [EventsService], exports: [EventsService] }) export class EventsModule {}
