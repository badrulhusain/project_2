import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Protected, AuthUser } from '../common/auth.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, RegisterOrganizationDto } from './dto.js';
@ApiTags('auth') @Controller('auth') export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('register') @Throttle({ default: { ttl: 60000, limit: 5 } }) register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('register-organization') @Throttle({ default: { ttl: 60000, limit: 5 } }) registerOrganization(@Body() dto: RegisterOrganizationDto) { return this.auth.registerOrganization(dto); }
  @Post('login') @Throttle({ default: { ttl: 60000, limit: 5 } }) login(@Body() dto: LoginDto) { return this.auth.login(dto); }
  @Get('me') @Protected() me(@Req() req: { user: AuthUser }) { return this.auth.me(req.user.id); }
}
