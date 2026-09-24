import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>('isPublic', [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Token requerido');
    try {
      const secret = new TextEncoder().encode(this.config.getOrThrow<string>('JWT_ACCESS_SECRET'));
      const { payload } = await jwtVerify(token, secret);
      if (!payload.sub) throw new Error('subject missing');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, role: true, active: true } });
      if (!user?.active) throw new Error('inactive user');
      request.user = { id: user.id, name: user.name, role: user.role };
      return true;
    } catch { throw new UnauthorizedException('Token invalido o expirado'); }
  }
}