import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // No permission required, access granted
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user || !user.roles) {
      return false; // No user or roles attached to the request
    }

    // Check if any of the user's roles has the required permission
    return user.roles.some(role =>
      role.permissions.some(permission => permission.name === requiredPermission),
    );
  }
}
