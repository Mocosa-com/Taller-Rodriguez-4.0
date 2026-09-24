import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, ProductType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/database/prisma.service';

type InvoiceInput = { customerId: string; vehicleId?: string; type: 'CONSUMIDOR_FINAL' | 'CREDITO_FISCAL'; offerId?: string; items: { productId: string; quantity: number }[] };
@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  list() { return this.prisma.invoice.findMany({ orderBy: { issuedAt: 'desc' }, include: { customer: true, items: true } }); }
  async create(userId: string, input: InvoiceInput) {
    if (!input.items.length) throw new UnprocessableEntityException('La factura requiere items');
    return this.prisma.$transaction(async (tx) => {
      const shift = await tx.cashShift.findFirst({ where: { status: 'ABIERTA' }, orderBy: { openedAt: 'desc' } });
      if (!shift) throw new ConflictException('Debe abrir caja antes de facturar');
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer?.active) throw new NotFoundException('Cliente no encontrado');
      const products = await Promise.all(input.items.map((item) => tx.product.findUnique({ where: { id: item.productId } })));
      if (products.some((p) => !p || !p.active)) throw new NotFoundException('Producto no encontrado');
      const lines = input.items.map((item, i) => { const product = products[i]!; if (item.quantity <= 0) throw new UnprocessableEntityException('Cantidad invalida'); if (product.type === ProductType.PRODUCTO && product.stock.lt(item.quantity)) throw new ConflictException(`Stock insuficiente para ${product.sku}`); const price = product.salePrice; return { product, quantity: new Prisma.Decimal(item.quantity), unitPrice: price, lineTotal: price.mul(item.quantity) }; });
      const subtotal = lines.reduce((sum, line) => sum.add(line.lineTotal), new Prisma.Decimal(0));
      const offer = input.offerId ? await tx.offer.findUnique({ where: { id: input.offerId } }) : null;
      const today = new Date();
      const discountPercent = offer && offer.active && offer.startsAt <= today && offer.endsAt >= today ? offer.discountPercent : new Prisma.Decimal(0);
      const discount = subtotal.mul(discountPercent).div(100);
      const total = subtotal.sub(discount);
      const ivaRate = new Prisma.Decimal(this.config.get<string>('IVA_RATE', '0.13'));
      const taxableBase = total.div(new Prisma.Decimal(1).add(ivaRate));
      const tax = total.sub(taxableBase);
      const invoice = await tx.invoice.create({ data: { code: `FACT-${Date.now()}`, customerId: input.customerId, vehicleId: input.vehicleId, shiftId: shift.id, issuedById: userId, type: input.type, subtotal, discount, taxableBase, tax, total, offerId: offer?.id, items: { create: lines.map((line) => ({ productId: line.product.id, description: line.product.name, itemType: line.product.type, quantity: line.quantity, unitPrice: line.unitPrice, lineTotal: line.lineTotal })) } }, include: { items: true } });
      for (const line of lines) if (line.product.type === ProductType.PRODUCTO) { await tx.product.update({ where: { id: line.product.id }, data: { stock: { decrement: line.quantity } } }); await tx.inventoryMovement.create({ data: { productId: line.product.id, invoiceId: invoice.id, performedById: userId, quantity: line.quantity.neg(), movementType: 'VENTA', reason: `Factura ${invoice.code}` } }); }
      await tx.cashShift.update({ where: { id: shift.id }, data: { expectedAmount: { increment: total } } });
      return invoice;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async annul(id: string, userId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
      if (!invoice) throw new NotFoundException('Factura no encontrada');
      if (invoice.status === 'ANULADA') return invoice;
      for (const item of invoice.items) if (item.itemType === ProductType.PRODUCTO) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, invoiceId: invoice.id, performedById: userId, quantity: item.quantity, movementType: 'REVERSA', reason } });
      }
      await tx.cashShift.update({ where: { id: invoice.shiftId }, data: { expectedAmount: { decrement: invoice.total } } });
      return tx.invoice.update({ where: { id }, data: { status: 'ANULADA', annulledAt: new Date(), annulledById: userId, annulmentReason: reason }, include: { items: true } });
    });
  }
}