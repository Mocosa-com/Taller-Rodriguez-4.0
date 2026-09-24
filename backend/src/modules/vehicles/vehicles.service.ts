import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}
  list(customerId?: string) { return this.prisma.vehicle.findMany({ where: customerId ? { customerId } : undefined, include: { customer: true, assignedMechanic: { select: { id: true, name: true } } }, orderBy: { intakeAt: 'desc' } }); }
  create(data: Record<string, unknown>) { return this.prisma.vehicle.create({ data: data as never, include: { customer: true } }); }
  async find(id: string) { const vehicle = await this.prisma.vehicle.findUnique({ where: { id }, include: { customer: true, workOrders: { include: { tasks: true } }, invoices: true } }); if (!vehicle) throw new NotFoundException('Vehiculo no encontrado'); return vehicle; }
  async update(id: string, data: Record<string, unknown>) { await this.find(id); return this.prisma.vehicle.update({ where: { id }, data: data as never }); }
  async deliver(id: string) { await this.find(id); return this.prisma.vehicle.update({ where: { id }, data: { status: 'ENTREGADO', deliveredAt: new Date() } }); }
}