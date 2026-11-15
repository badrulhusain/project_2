import { applyDecorators, CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
export type AuthUser = { id: string; email: string; role: Role };
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
@Injectable() export class JwtAuthGuard extends AuthGuard('jwt') {}
@Injectable() export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user) throw new UnauthorizedException();
    if (!roles.includes(user.role)) throw new ForbiddenException();
    return true;
  }
}
export const Protected = (...roles: Role[]) => applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles), ApiBearerAuth());
