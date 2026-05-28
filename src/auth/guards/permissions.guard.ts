import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>(PERMISSIONS_KEY, context.getHandler());

    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user || !user.role) return false;

    return user.role === requiredRole || user.role === 'admin';
  }
}
