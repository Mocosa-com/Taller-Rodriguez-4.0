import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma.service';
import * as argon2 from 'argon2';
import { SignJWT } from 'jose';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async login(identifier: string, password: string) {
    const normalized = identifier.trim();
    const user = await this.prisma.user.findFirst({ where: { active: true, OR: [{ dui: normalized }, { email: normalized.toLowerCase() }, { name: { equals: normalized, mode: 'insensitive' } }] } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Credenciales invalidas');
    const secret = new TextEncoder().encode(this.config.getOrThrow<string>('JWT_ACCESS_SECRET'));
    const accessToken = await new SignJWT({ role: user.role, name: user.name }).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt().setExpirationTime(this.config.get<string>('JWT_ACCESS_TTL', '15m')).sign(secret);
    return { accessToken, user: { id: user.id, name: user.name, dui: user.dui, email: user.email, role: user.role } };
  }

  async me(id: string) { return this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, dui: true, phone: true, email: true, role: true, avatarUrl: true } }); }
}