import { Module } from '@nestjs/common';
import { BookingsController, MyBookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
@Module({ controllers: [BookingsController, MyBookingsController], providers: [BookingsService], exports: [BookingsService] }) export class BookingsModule {}
