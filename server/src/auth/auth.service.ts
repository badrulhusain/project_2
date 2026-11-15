import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto, RegisterOrganizationDto } from './dto.js';
import { UsersService } from '../users/users.service.js';
@Injectable() export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private users: UsersService) {}
  private safe(user: { id: string; name: string; email: string; role: Role; createdAt: Date; organization?: { id: string; name: string; slug: string } | null }) { const { id, name, email, role, createdAt } = user; return { id, name, email, role, createdAt, organization: user.organization ?? null }; }
  private token(user: { id: string; email: string; role: Role }) { return this.jwt.sign({ sub: user.id, email: user.email, role: user.role }); }
  async register(dto: RegisterDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })) throw new ConflictException('Email already registered');
    const role = dto.adminCode && dto.adminCode === process.env.ADMIN_SIGNUP_CODE ? Role.ADMIN : Role.USER;
    const user = await this.prisma.user.create({ data: { name: dto.name, email: dto.email.toLowerCase(), passwordHash: await bcrypt.hash(dto.password, 12), role } });
    return { accessToken: this.token(user), user: this.safe(user) };
  }
  async registerOrganization(dto: RegisterOrganizationDto) {
    const email = dto.email.trim().toLowerCase();
    const organizationName = dto.organizationName.trim();
    const name = dto.name?.trim() || organizationName;
    if (await this.prisma.user.findUnique({ where: { email } })) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const baseSlug = organizationName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'organization';
    try {
      const { user, organization } = await this.prisma.$transaction(async tx => {
        const organization = await tx.organization.create({ data: { name: organizationName, slug: `${baseSlug}-${randomUUID().slice(0, 8)}` } });
        const user = await tx.user.create({ data: { name, email, passwordHash, role: Role.ORGANIZER, organizationId: organization.id } });
        return { user, organization };
      }, { maxWait: 30000, timeout: 60000 });
      return { accessToken: this.token(user), user: this.safe({ ...user, organization }) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Email already registered');
      throw error;
    }
  }
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  /** Exchange a Neon Auth (Google) JWT for an EventSense session. New users become attendees. */
  async loginWithNeon(token: string, asOrganizer = false) {
    const url = process.env.NEON_AUTH_JWKS_URL;
    if (!url) throw new UnauthorizedException('Google sign-in is not configured');
    this.jwks ??= createRemoteJWKSet(new URL(url));
    let payload: Record<string, unknown>;
    try { ({ payload } = await jwtVerify(token, this.jwks)); } catch { throw new UnauthorizedException('Invalid Google sign-in'); }
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email) throw new UnauthorizedException('Google account has no email');
    if (payload.email_verified === false) throw new UnauthorizedException('Google email is not verified');
    const name = (typeof payload.name === 'string' && payload.name.trim()) || email.split('@')[0];
    const include = { organization: { select: { id: true, name: true, slug: true } } };
    let user = await this.prisma.user.findUnique({ where: { email }, include });
    if (!user) user = await this.prisma.user.create({ data: { name, email, role: asOrganizer ? Role.ORGANIZER : Role.USER, passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 12) }, include });
    return { accessToken: this.token(user), user: this.safe(user) };
  }
  /** Organizers who signed up with Google name their organization after signup. */
  async setOrganization(userId: string, organizationName: string) {
    const name = organizationName.trim();
    const include = { organization: { select: { id: true, name: true, slug: true } } };
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include });
    if (current.organizationId) {
      await this.prisma.organization.update({ where: { id: current.organizationId }, data: { name } });
    } else {
      const slug = `${name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'organization'}-${randomUUID().slice(0, 8)}`;
      const organization = await this.prisma.organization.create({ data: { name, slug } });
      await this.prisma.user.update({ where: { id: userId }, data: { organizationId: organization.id } });
    }
    return this.safe(await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include }));
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() }, include: { organization: { select: { id: true, name: true, slug: true } } } });
    if (!user || !await bcrypt.compare(dto.password, user.passwordHash)) throw new UnauthorizedException('Invalid credentials');
    return { accessToken: this.token(user), user: this.safe(user) };
  }
  me(id: string) { return this.users.profile(id); }
}

