import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Protected, AuthUser } from '../common/auth.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, RegisterOrganizationDto, NeonLoginDto, SetOrganizationDto } from './dto.js';
@ApiTags('auth') @Controller('auth') export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') @Throttle({ default: { ttl: 60000, limit: 5 } }) register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('register-organization') @Throttle({ default: { ttl: 60000, limit: 5 } }) registerOrganization(@Body() dto: RegisterOrganizationDto) { return this.auth.registerOrganization(dto); }
  @Post('neon') @Throttle({ default: { ttl: 60000, limit: 10 } }) neon(@Body() dto: NeonLoginDto) { return this.auth.loginWithNeon(dto.token, dto.asOrganizer); }
  @Post('organization') @Protected(Role.ORGANIZER) setOrganization(@Body() dto: SetOrganizationDto, @Req() req: { user: AuthUser }) { return this.auth.setOrganization(req.user.id, dto.organizationName); }
  @Post('become-organizer') @Protected() becomeOrganizer(@Body() dto: SetOrganizationDto, @Req() req: { user: AuthUser }) { return this.auth.becomeOrganizer(req.user.id, dto.organizationName); }
  @Post('login') @Throttle({ default: { ttl: 60000, limit: 5 } }) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Get('me') @Protected() me(@Req() req: { user: AuthUser }) { return this.auth.me(req.user.id); }
}
