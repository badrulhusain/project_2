import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CollectDto } from './dto.js';
@Injectable() export class CheckinService {
  constructor(private prisma: PrismaService) {}
  private async isAdmin(userId: string) { return (await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role === 'ADMIN'; }
  async scan(qrToken: string, adminId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { qrToken }, include: { event: true } });
    if (!booking) throw new NotFoundException('Ticket not found');
    if (booking.event.createdById !== adminId && !await this.isAdmin(adminId)) throw new ForbiddenException();
    if (booking.status !== 'CONFIRMED') throw new BadRequestException('Ticket is not available for check-in');
    const result = await this.prisma.booking.updateMany({ where: { id: booking.id, status: 'CONFIRMED' }, data: { status: 'CHECKED_IN', checkedInAt: new Date() } });
    if (result.count !== 1) throw new BadRequestException('Ticket already scanned');
    return this.prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
  }
  async collect(dto: CollectDto, adminId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { qrToken: dto.qrToken }, include: { event: true, foodOrder: { include: { items: true } } } });
    if (!booking) throw new NotFoundException('Ticket not found');
    if (booking.event.createdById !== adminId && !await this.isAdmin(adminId)) throw new ForbiddenException();
    if (booking.status !== 'CHECKED_IN') throw new BadRequestException('Check-in required');
    if (!booking.foodOrder) throw new BadRequestException('No food order');
    if (new Set(dto.items.map(i => i.foodItemId)).size !== dto.items.length) throw new BadRequestException('Duplicate food item');
    return this.prisma.$transaction(async tx => {
      const updated = [];
      for (const item of dto.items) {
        const current = booking.foodOrder!.items.find(i => i.foodItemId === item.foodItemId);
        if (!current) throw new BadRequestException('Food item not ordered');
        const result = await tx.foodOrderItem.updateMany({ where: { id: current.id, collectedQty: { lte: current.quantity - item.quantity } }, data: { collectedQty: { increment: item.quantity } } });
        if (result.count !== 1) throw new BadRequestException('Collection exceeds remaining quantity');
        updated.push({ foodItemId: item.foodItemId, collected: item.quantity });
      }
      return updated;
    });
  }
}
