import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsService } from '../events/events.service.js';
import * as forecast from './forecast.js';
@Injectable() export class PlannerService {
  constructor(private prisma: PrismaService, private events: EventsService) {}
  async generate(eventId: string, userId: string) {
    const event = await this.events.own(eventId, userId);
    const [stat, bookings, foodItems, zones, equipment] = await Promise.all([
      this.prisma.calibrationStat.findUnique({ where: { eventType_isPaid: { eventType: event.type, isPaid: event.isPaid } } }),
      this.prisma.booking.findMany({ where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } }, include: { foodOrder: { include: { items: true } } } }),
      this.prisma.foodItem.findMany({ where: { eventId } }), this.prisma.parkingZone.findMany({ where: { eventId } }), this.prisma.equipment.findMany({ where: { eventId } }),
    ]);
    const rates = stat ?? forecast.DEFAULT_RATES[event.isPaid ? 'paid' : 'free'];
    const attendance = forecast.attendance(bookings.reduce((sum, b) => sum + b.seats, 0), rates);
    const capacity = Math.min(event.capacity, event.safetyLimit);
    return { attendance, seats: forecast.seats(attendance.likely, capacity, event.isPaid),
      food: forecast.food(foodItems.map(item => ({ id: item.id, name: item.name, unitCost: item.unitCost,
        ordered: bookings.flatMap(b => b.foodOrder?.items ?? []).filter(i => i.foodItemId === item.id).reduce((sum, i) => sum + i.quantity, 0) })), attendance, rates),
      parking: forecast.parking(zones.map(z => ({ id: z.id, name: z.name, capacity: z.capacity, booked: bookings.filter(b => b.parkingZoneId === z.id).length })), rates),
      power: forecast.power(event.startAt, event.endAt, equipment, attendance.likely, capacity, event.powerLimitKw), generatedAt: new Date().toISOString() };
  }
}
