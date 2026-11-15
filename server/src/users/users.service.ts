import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
@Injectable() export class UsersService {
  constructor(private prisma: PrismaService) {}
  async profile(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true, organization: { select: { id: true, name: true, slug: true } } } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
