import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async list(search?: string, lowStock = false) {
    const products = await this.prisma.product.findMany({ where: { active: true, ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : {}) }, include: { supplier: true }, orderBy: { name: 'asc' } });
    return lowStock ? products.filter((product) => product.stock.lte(product.minimumStock)) : products;
  }
  create(data: Record<string, unknown>) { return this.prisma.product.create({ data: data as never }); }
  async find(id: string) { const item = await this.prisma.product.findUnique({ where: { id }, include: { supplier: true } }); if (!item) throw new NotFoundException('Producto no encontrado'); return item; }
  async update(id: string, data: Record<string, unknown>) { await this.find(id); return this.prisma.product.update({ where: { id }, data: data as never }); }
  async remove(id: string) { await this.find(id); return this.prisma.product.update({ where: { id }, data: { active: false } }); }
  async adjustStock(productId: string, quantity: number, userId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Producto no encontrado');
      const nextStock = product.stock.add(quantity);
      if (nextStock.lt(0)) throw new Error('El stock no puede ser negativo');
      const updated = await tx.product.update({ where: { id: productId }, data: { stock: nextStock } });
      await tx.inventoryMovement.create({ data: { productId, performedById: userId, quantity, movementType: quantity >= 0 ? 'ENTRADA' : 'SALIDA', reason } });
      return updated;
    });
  }
}