import { UserRole } from '@prisma/client';

export interface AuthUser { id: string; role: UserRole; name: string; }

export const AUTH_USER = Symbol('AUTH_USER');