import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto, EquipmentDto, FoodItemDto, ParkingZoneDto, UpdateEventDto } from './dto.js';
@Injectable() export class EventsService {
  constructor(private prisma: PrismaService) {}
  async isAdmin(userId: string) { return (await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role === 'ADMIN'; }
  async own(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdById !== userId && !await this.isAdmin(userId)) throw new ForbiddenException('Not your event');
    return event;
  }
  private dates(dto: Partial<CreateEventDto>) {
    if (dto.startAt && dto.endAt && new Date(dto.startAt) >= new Date(dto.endAt)) throw new BadRequestException('endAt must be after startAt');
    return { ...dto, startAt: dto.startAt ? new Date(dto.startAt) : undefined, endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      bookingCutoffAt: dto.bookingCutoffAt ? new Date(dto.bookingCutoffAt) : undefined,
      foodCutoffAt: dto.foodCutoffAt ? new Date(dto.foodCutoffAt) : undefined,
      seatReleaseAt: dto.seatReleaseAt ? new Date(dto.seatReleaseAt) : undefined };
  }
  async create(dto: CreateEventDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true } });
    if (!user) throw new NotFoundException('Organizer not found');
    return this.prisma.event.create({ data: { ...this.dates(dto), createdById: userId, organizationId: user.organizationId } as Prisma.EventUncheckedCreateInput });
  }
  async update(id: string, dto: UpdateEventDto, userId: string) { await this.own(id, userId); return this.prisma.event.update({ where: { id }, data: this.dates(dto) as Prisma.EventUncheckedUpdateInput }); }
  async publish(id: string, userId: string) {
    const event = await this.own(id, userId);
    if (event.status !== EventStatus.DRAFT) throw new BadRequestException('Only draft events can be published');
    return this.prisma.$transaction(async tx => {
      const published = await tx.event.update({ where: { id }, data: { status: EventStatus.PUBLISHED } });
      await tx.notification.createMany({ data: [
        { eventId: id, createdById: userId, title: 'Food timing reminder', body: 'Please arrive on time for your food order.', type: 'FOOD', scheduledAt: new Date(event.startAt.getTime() - 3600000) },
        { eventId: id, createdById: userId, title: 'Last call for food', body: 'Food preorders close now.', type: 'FOOD', scheduledAt: event.foodCutoffAt },
      ] });
      return published;
    });
  }
  async list(page: number, limit: number) {
    const events = await this.prisma.event.findMany({ where: { status: { in: [EventStatus.PUBLISHED, EventStatus.LIVE] } }, skip: (page - 1) * limit, take: limit, orderBy: { startAt: 'asc' } });
    if (!events.length) return [];
    const ids = events.map(event => event.id);
    const [counts, zones, parking] = await Promise.all([
      this.prisma.booking.groupBy({ by: ['eventId'], where: { eventId: { in: ids }, status: { in: ['CONFIRMED', 'CHECKED_IN'] } }, _count: true }),
      this.prisma.parkingZone.findMany({ where: { eventId: { in: ids } } }),
      this.prisma.booking.groupBy({ by: ['parkingZoneId'], where: { eventId: { in: ids }, status: { in: ['CONFIRMED', 'CHECKED_IN'] }, parkingZoneId: { not: null } }, _count: true }),
    ]);
    return events.map(event => { const seatsTaken = counts.find(row => row.eventId === event.id)?._count ?? 0; return { ...event, seatsTaken, seatsAvailable: Math.max(0, Math.min(event.capacity, event.safetyLimit) - seatsTaken), parkingAvailability: zones.filter(zone => zone.eventId === event.id).map(zone => ({ ...zone, available: Math.max(0, zone.capacity - (parking.find(row => row.parkingZoneId === zone.id)?._count ?? 0)) })) }; });
  }
  async adminList(userId: string) { return this.prisma.event.findMany({ where: (await this.isAdmin(userId)) ? {} : { createdById: userId }, include: { _count: { select: { bookings: true } } }, orderBy: { startAt: 'desc' } }); }
  async attendees(eventId: string, userId: string) {
    await this.own(eventId, userId);
    return this.prisma.booking.findMany({ where: { eventId }, include: { user: { select: { id: true, name: true, email: true } }, parkingZone: true, foodOrder: { include: { items: { include: { foodItem: true } } } } }, orderBy: { createdAt: 'asc' } });
  }
  async detail(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, include: { foodItems: true, parkingZones: true, equipment: true } });
    if (!event || (event.status !== EventStatus.PUBLISHED && event.status !== EventStatus.LIVE)) throw new NotFoundException('Event not found');
    const [seatsTaken, waitlistCount, parking] = await Promise.all([
      this.prisma.booking.count({ where: { eventId: id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } } }),
      this.prisma.booking.count({ where: { eventId: id, status: 'WAITLISTED' } }),
      this.prisma.booking.groupBy({ by: ['parkingZoneId'], where: { eventId: id, status: { in: ['CONFIRMED', 'CHECKED_IN'] }, parkingZoneId: { not: null } }, _count: true }),
    ]);
    return { ...event, seatsTaken, seatsAvailable: Math.max(0, Math.min(event.capacity, event.safetyLimit) - seatsTaken), waitlistCount,
      parkingAvailability: event.parkingZones.map(z => ({ ...z, available: Math.max(0, z.capacity - (parking.find(p => p.parkingZoneId === z.id)?._count ?? 0)) })) };
  }
  async addFood(id: string, userId: string, dto: FoodItemDto) { await this.own(id, userId); return this.prisma.foodItem.create({ data: { ...dto, eventId: id } }); }
  async updateFood(id: string, childId: string, userId: string, dto: FoodItemDto) { await this.own(id, userId); return this.prisma.foodItem.update({ where: { id: childId, eventId: id }, data: dto }); }
  async addParking(id: string, userId: string, dto: ParkingZoneDto) { await this.own(id, userId); return this.prisma.parkingZone.create({ data: { ...dto, eventId: id } }); }
  async updateParking(id: string, childId: string, userId: string, dto: ParkingZoneDto) { await this.own(id, userId); return this.prisma.parkingZone.update({ where: { id: childId, eventId: id }, data: dto }); }
  async addEquipment(id: string, userId: string, dto: EquipmentDto) { await this.own(id, userId); return this.prisma.equipment.create({ data: { ...dto, eventId: id, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt) } }); }
  async updateEquipment(id: string, childId: string, userId: string, dto: EquipmentDto) { await this.own(id, userId); return this.prisma.equipment.update({ where: { id: childId, eventId: id }, data: { ...dto, startAt: new Date(dto.startAt), endAt: new Date(dto.endAt) } }); }
  async config(id: string, type: 'foodItem' | 'parkingZone' | 'equipment') {
    if (!await this.prisma.event.findUnique({ where: { id } })) throw new NotFoundException('Event not found');
    return type === 'foodItem' ? this.prisma.foodItem.findMany({ where: { eventId: id } }) : type === 'parkingZone' ? this.prisma.parkingZone.findMany({ where: { eventId: id } }) : this.prisma.equipment.findMany({ where: { eventId: id } });
  }
  async remove(id: string, childId: string, userId: string, type: 'foodItem' | 'parkingZone' | 'equipment') {
    await this.own(id, userId);
    if (type === 'foodItem') return this.prisma.foodItem.delete({ where: { id: childId, eventId: id } });
    if (type === 'parkingZone') return this.prisma.parkingZone.delete({ where: { id: childId, eventId: id } });
    return this.prisma.equipment.delete({ where: { id: childId, eventId: id } });
  }
}
