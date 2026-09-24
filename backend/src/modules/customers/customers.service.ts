import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
  list(search?: string) { return this.prisma.customer.findMany({ where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { dui: { contains: search } }, { phone: { contains: search } }] } : undefined, orderBy: { createdAt: 'desc' }, include: { _count: { select: { vehicles: true, invoices: true } } } }); }
  create(data: Record<string, unknown>) { return this.prisma.customer.create({ data: data as never }); }
  async find(id: string) { const item = await this.prisma.customer.findUnique({ where: { id }, include: { vehicles: true } }); if (!item) throw new NotFoundException('Cliente no encontrado'); return item; }
  async update(id: string, data: Record<string, unknown>) { await this.find(id); return this.prisma.customer.update({ where: { id }, data: data as never }); }
  async remove(id: string) { await this.find(id); return this.prisma.customer.update({ where: { id }, data: { active: false } }); }
}