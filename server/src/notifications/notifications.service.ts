import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsService } from '../events/events.service.js';
import { BookingsService } from '../bookings/bookings.service.js';
import { NotificationDto } from './dto.js';
import { lockEvent } from '../common/lock-event.js';
@Injectable() export class NotificationsService {
  private logger = new Logger(NotificationsService.name);
  constructor(private prisma: PrismaService, private events: EventsService, private bookings: BookingsService, private mail: MailService) {}
  async create(eventId: string, userId: string, dto: NotificationDto) {
    await this.events.own(eventId, userId);
    const notification = await this.prisma.notification.create({ data: { ...dto, eventId, createdById: userId, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date() } });
    if (!dto.scheduledAt) await this.deliver(notification);
    return notification;
  }
  async list(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdById !== userId && !await this.prisma.booking.findFirst({ where: { eventId, userId, status: { in: ['CONFIRMED', 'CHECKED_IN', 'WAITLISTED'] } } })) throw new ForbiddenException();
    return this.prisma.notification.findMany({ where: { eventId, OR: [{ recipientUserId: null }, { recipientUserId: userId }] }, orderBy: { scheduledAt: 'desc' } });
  }
  private email(to: string, subject: string, body: string) { return this.mail.send(to, subject, body); }
  private async deliver(n: { id: string; eventId: string; recipientUserId: string | null; title: string; body: string }) {
    const users = await this.prisma.booking.findMany({ where: { eventId: n.eventId, status: { in: ['CONFIRMED', 'CHECKED_IN', 'WAITLISTED'] }, userId: n.recipientUserId ?? undefined }, include: { user: true } });
    for (const b of users) await this.email(b.user.email, n.title, n.body);
    await this.prisma.notification.update({ where: { id: n.id }, data: { sentAt: new Date() } });
  }
  @Cron('* * * * *') async runDue() {
    const due = await this.prisma.notification.findMany({ where: { scheduledAt: { lte: new Date() }, sentAt: null }, take: 50 });
    for (const n of due) {
      try { await this.deliver(n); }
      catch (error) { this.logger.error(`Notification ${n.id} failed`, error); }
    }
    const events = await this.prisma.event.findMany({ where: { seatReleaseAt: { lte: new Date() }, status: { in: ['PUBLISHED', 'LIVE'] } } });
    for (const event of events) {
      await this.prisma.$transaction(async tx => {
        await lockEvent(tx, event.id);
        const unreleased = await tx.booking.findMany({ where: { eventId: event.id, status: 'CONFIRMED' } });
        if (unreleased.length) await tx.booking.updateMany({ where: { id: { in: unreleased.map(b => b.id) } }, data: { status: 'RELEASED', parkingZoneId: null } });
        while (await this.bookings.promote(tx, event.id)) { /* fill released seats */ }
        await tx.event.update({ where: { id: event.id }, data: { seatReleaseAt: null } });
      });
    }
  }
}
