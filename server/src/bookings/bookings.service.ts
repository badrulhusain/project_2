import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service.js';
import { lockEvent } from '../common/lock-event.js';
@Injectable() export class BookingsService {
  constructor(private prisma: PrismaService) {}
  async book(eventId: string, userId: string, parkingZoneId?: string, seats = 1) {
    return this.prisma.$transaction(async tx => {
      await lockEvent(tx, eventId);
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException('Event not found');
      if (!['PUBLISHED', 'LIVE'].includes(event.status) || new Date() > event.bookingCutoffAt) throw new BadRequestException('Booking is closed');
      if (await tx.booking.findUnique({ where: { eventId_userId: { eventId, userId } } })) throw new ConflictException('Already booked');
      const occupied = (await tx.booking.aggregate({ where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } }, _sum: { seats: true } }))._sum.seats ?? 0;
      const confirmed = occupied + seats <= Math.min(event.capacity, event.safetyLimit);
      if (parkingZoneId) {
        const zone = await tx.parkingZone.findUnique({ where: { id: parkingZoneId } });
        if (!zone || zone.eventId !== eventId) throw new BadRequestException('Invalid parking zone');
        const used = await tx.booking.count({ where: { parkingZoneId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } } });
        if (confirmed && used >= zone.capacity) throw new ConflictException('Parking zone is full');
      }
      const position = confirmed ? null : 1 + ((await tx.booking.aggregate({ where: { eventId, status: 'WAITLISTED' }, _max: { waitlistPosition: true } }))._max.waitlistPosition ?? 0);
      const booking = await tx.booking.create({ data: { eventId, userId, seats, status: confirmed ? 'CONFIRMED' : 'WAITLISTED', waitlistPosition: position, qrToken: randomUUID(), parkingZoneId } });
      if (confirmed) await tx.notification.create({ data: { eventId, createdById: event.createdById, recipientUserId: userId, title: 'Booking confirmed', body: seats > 1 ? `Your ${seats} seats are confirmed.` : 'Your seat is confirmed.', type: 'INFO', scheduledAt: new Date() } });
      return booking;
    }, { maxWait: 30000, timeout: 60000 });
  }
  my(userId: string) { return this.prisma.booking.findMany({ where: { userId }, include: { event: { include: { foodItems: true, parkingZones: true } }, parkingZone: true, foodOrder: { include: { items: true } } }, orderBy: { createdAt: 'desc' } }); }
  async getOwn(id: string, userId: string) { const booking = await this.prisma.booking.findUnique({ where: { id }, include: { event: true } }); if (!booking) throw new NotFoundException('Booking not found'); if (booking.userId !== userId) throw new ForbiddenException(); return booking; }
  async cancel(id: string, userId: string) {
    const booking = await this.getOwn(id, userId);
    if (['CANCELLED', 'RELEASED', 'CHECKED_IN'].includes(booking.status)) throw new BadRequestException('Cannot cancel this booking');
    return this.prisma.$transaction(async tx => {
      await lockEvent(tx, booking.eventId);
      const current = await tx.booking.findUniqueOrThrow({ where: { id } });
      if (!['CONFIRMED', 'WAITLISTED'].includes(current.status)) throw new ConflictException('Booking already changed');
      await tx.booking.update({ where: { id }, data: { status: 'CANCELLED', parkingZoneId: null } });
      if (current.status === 'CONFIRMED') while (await this.promote(tx, booking.eventId)) { /* fill freed seats */ }
      return { status: 'CANCELLED' };
    });
  }
  async promote(tx: Prisma.TransactionClient, eventId: string) {
    const event = await tx.event.findUniqueOrThrow({ where: { id: eventId } });
    const occupied = (await tx.booking.aggregate({ where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } }, _sum: { seats: true } }))._sum.seats ?? 0;
    const free = Math.min(event.capacity, event.safetyLimit) - occupied;
    if (free <= 0) return null;
    const next = await tx.booking.findFirst({ where: { eventId, status: 'WAITLISTED', seats: { lte: free } }, orderBy: [{ waitlistPosition: 'asc' }, { createdAt: 'asc' }], include: { user: true } });
    if (!next) return null;
    if (next.parkingZoneId) {
      const zone = await tx.parkingZone.findUnique({ where: { id: next.parkingZoneId } });
      const used = await tx.booking.count({ where: { parkingZoneId: next.parkingZoneId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } } });
      if (!zone || used >= zone.capacity) await tx.booking.update({ where: { id: next.id }, data: { parkingZoneId: null } });
    }
    await tx.booking.update({ where: { id: next.id }, data: { status: 'CONFIRMED', waitlistPosition: null } });
    await tx.notification.create({ data: { eventId, createdById: event.createdById, recipientUserId: next.userId, title: 'Waitlist promoted', body: 'A seat is now available for you.', type: 'INFO', scheduledAt: new Date() } });
    return next.id;
  }
  async ticket(id: string, userId: string) { const booking = await this.getOwn(id, userId); return { booking, qrDataUrl: await QRCode.toDataURL(booking.qrToken) }; }
}
