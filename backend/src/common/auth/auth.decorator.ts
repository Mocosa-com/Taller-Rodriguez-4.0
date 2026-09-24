import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AUTH_USER } from './auth.types';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
export const Public = () => SetMetadata('isPublic', true);
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest().user);