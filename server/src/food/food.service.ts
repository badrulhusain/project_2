import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FoodOrderDto } from './dto.js';
import { lockEvent } from '../common/lock-event.js';
@Injectable() export class FoodService {
  constructor(private prisma: PrismaService) {}
  async order(bookingId: string, userId: string, dto: FoodOrderDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId }, include: { event: true, foodOrder: { include: { items: true } } } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();
    if (!['CONFIRMED', 'CHECKED_IN'].includes(booking.status)) throw new BadRequestException('Active booking required');
    if (new Date() > booking.event.foodCutoffAt) throw new BadRequestException('Food ordering is closed');
    if (new Set(dto.items.map(i => i.foodItemId)).size !== dto.items.length) throw new BadRequestException('Duplicate food item');
    const totalMeals = dto.items.reduce((sum, i) => sum + i.quantity, 0);
    if (totalMeals > booking.seats) throw new BadRequestException(`You can order up to ${booking.seats} ${booking.seats === 1 ? 'meal' : 'meals'} for ${booking.seats} reserved ${booking.seats === 1 ? 'seat' : 'seats'}`);
    if (booking.foodOrder?.items.some(i => i.collectedQty > 0)) throw new ConflictException('Collected food order cannot be replaced');
    return this.prisma.$transaction(async tx => {
      await lockEvent(tx, booking.eventId);
      for (const item of dto.items) {
        const food = await tx.foodItem.findUnique({ where: { id: item.foodItemId } });
        if (!food || food.eventId !== booking.eventId) throw new BadRequestException('Invalid food item');
        if (food.maxQuantity !== null) {
          const otherOrders = await tx.foodOrderItem.aggregate({ where: { foodItemId: item.foodItemId, order: { bookingId: { not: bookingId }, booking: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } } }, _sum: { quantity: true } });
          if ((otherOrders._sum.quantity ?? 0) + item.quantity > food.maxQuantity) throw new ConflictException(`${food.name} is sold out`);
        }
      }
      if (booking.foodOrder) {
        await tx.foodOrderItem.deleteMany({ where: { orderId: booking.foodOrder.id } });
        await tx.foodOrder.delete({ where: { bookingId } });
      }
      return tx.foodOrder.create({ data: { bookingId, items: { create: dto.items } }, include: { items: true } });
    }, { maxWait: 30000, timeout: 60000 });
  }
  async get(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException();
    return this.prisma.foodOrder.findUnique({ where: { bookingId }, include: { items: { include: { foodItem: true } } } });
  }
}
