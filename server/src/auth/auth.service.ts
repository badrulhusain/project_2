import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from './dto.js';
import { UsersService } from '../users/users.service.js';
@Injectable() export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private users: UsersService) {}
  private safe(user: { id: string; name: string; email: string; role: Role; createdAt: Date }) { const { id, name, email, role, createdAt } = user; return { id, name, email, role, createdAt }; }
  private token(user: { id: string; email: string; role: Role }) { return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }); }
  async register(dto: RegisterDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })) throw new ConflictException('Email already registered');
    const role = dto.adminCode && dto.adminCode === process.env.ADMIN_SIGNUP_CODE ? Role.ADMIN : Role.USER;
    const user = await this.prisma.user.create({ data: { name: dto.name, email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 12), role } });
    return { accessToken: this.token(user), user: this.safe(user) };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !await bcrypt.compare(dto.password, user.passwordHash)) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: this.token(user), user: this.safe(user) };
  }
  me(id: string) { return this.users.profile(id); }
}
