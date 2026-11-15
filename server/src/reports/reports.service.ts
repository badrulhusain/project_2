import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsService } from '../events/events.service.js';
import { PlannerService } from '../planner/planner.service.js';
import { CalibrationService } from '../calibration/calibration.service.js';
@Injectable() export class ReportsService {
  constructor(private prisma: PrismaService, private events: EventsService, private planner: PlannerService, private calibration: CalibrationService) {}
  async close(eventId: string, userId: string) {
    const event = await this.events.own(eventId, userId);
    if (event.status === 'CLOSED') throw new BadRequestException('Event already closed');
    const planned = await this.planner.generate(eventId, userId);
    const bookings = await this.prisma.booking.findMany({ where: { eventId }, include: { foodOrder: { include: { items: true } } } });
    const booked = bookings.filter(b => ['CONFIRMED', 'CHECKED_IN', 'RELEASED'].includes(b.status)).length;
    const checked = bookings.filter(b => b.status === 'CHECKED_IN');
    const collected = checked.flatMap(b => b.foodOrder?.items ?? []).reduce((sum, i) => sum + i.collectedQty, 0);
    const ordered = bookings.flatMap(b => b.foodOrder?.items ?? []).reduce((sum, i) => sum + i.quantity, 0);
    const actual = { attendance: checked.length, booked, foodCollected: collected, foodOrdered: ordered,
      parkingUsed: checked.filter(b => b.parkingZoneId).length, mealsSaved: Math.max(0, booked - collected),
      seatUtilization: checked.length / Math.min(event.capacity, event.safetyLimit), peakKw: planned.power.peakKw,
      foodByItem: Object.entries(checked.flatMap(b => b.foodOrder?.items ?? []).reduce<Record<string, number>>((acc, i) => { acc[i.foodItemId] = (acc[i.foodItemId] ?? 0) + i.collectedQty; return acc; }, {})).map(([foodItemId, quantity]) => ({ foodItemId, quantity })) };
    return this.prisma.$transaction(async tx => {
      await tx.event.update({ where: { id: eventId }, data: { status: 'CLOSED' } });
      const report = await tx.eventReport.create({ data: { eventId, plannedJson: planned as unknown as Prisma.InputJsonValue, actualJson: actual as Prisma.InputJsonValue } });
      await this.calibration.update(tx, event.type, event.isPaid, booked, checked.length, ordered, collected);
      return report;
    });
  }
  async report(eventId: string, userId: string) { await this.events.own(eventId, userId); const report = await this.prisma.eventReport.findUnique({ where: { eventId } }); if (!report) throw new NotFoundException('Report not found'); return report; }
  async savings(userId: string) {
    const reports = await this.prisma.eventReport.findMany({ where: { event: { createdById: userId, status: 'CLOSED' } } });
    return { events: reports.length, mealsSaved: reports.reduce((sum, r) => sum + Number((r.actualJson as Record<string, unknown>).mealsSaved ?? 0), 0) };
  }
}
