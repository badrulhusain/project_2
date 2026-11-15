import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser, Protected } from '../common/auth.js';
import { BookDto } from './dto.js';
import { BookingsService } from './bookings.service.js';
@ApiTags('bookings') @Controller() export class BookingsController {
  constructor(private bookings: BookingsService) {}
  @Post('events/:id/bookings') @Protected() book(@Param('id', ParseUUIDPipe) id: string, @Body() dto: BookDto, @Req() req: { user: AuthUser }) { return this.bookings.book(id, req.user.id, dto.parkingZoneId, dto.seats ?? 1); }
  @Delete('bookings/:id') @Protected() cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.bookings.cancel(id, req.user.id); }
  @Get('bookings/:id/ticket') @Protected() ticket(@Param('id', ParseUUIDPipe) id: string, @Req() req: { user: AuthUser }) { return this.bookings.ticket(id, req.user.id); }
}
@ApiTags('bookings') @Controller('me/bookings') export class MyBookingsController {
  constructor(private bookings: BookingsService) {}
  @Get() @Protected() my(@Req() req: { user: AuthUser }) { return this.bookings.my(req.user.id); }
}
