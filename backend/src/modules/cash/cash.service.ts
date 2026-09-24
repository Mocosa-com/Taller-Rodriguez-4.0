import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { ShiftStatus } from '@prisma/client';

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}
  active() { return this.prisma.cashShift.findFirst({ where: { status: ShiftStatus.ABIERTA }, include: { responsible: { select: { id: true, name: true } } } }); }
  list() { return this.prisma.cashShift.findMany({ orderBy: { openedAt: 'desc' }, include: { responsible: { select: { name: true } } } }); }
  async open(userId: string, openingAmount: number) { if (await this.active()) throw new ConflictException('Ya existe una caja abierta'); const last = await this.prisma.cashShift.findFirst({ orderBy: { shiftNumber: 'desc' } }); return this.prisma.cashShift.create({ data: { shiftNumber: (last?.shiftNumber ?? 0) + 1, responsibleId: userId, openingAmount, expectedAmount: openingAmount } }); }
  async close(id: string, countedAmount: number, notes?: string) { const shift = await this.prisma.cashShift.findUnique({ where: { id } }); if (!shift) throw new NotFoundException('Turno no encontrado'); if (shift.status === ShiftStatus.CERRADA) throw new ConflictException('El turno ya esta cerrado'); return this.prisma.cashShift.update({ where: { id }, data: { status: ShiftStatus.CERRADA, countedAmount, closedAt: new Date(), notes } }); }
}