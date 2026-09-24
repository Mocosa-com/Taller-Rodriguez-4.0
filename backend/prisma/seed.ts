import { PrismaClient, ProductType, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('TallerLocal2026!', { type: argon2.argon2id });
  const user = await prisma.user.upsert({ where: { dui: '00000000-0' }, update: {}, create: { name: 'Administrador Local', dui: '00000000-0', phone: '0000-0000', email: 'admin@taller.local', role: UserRole.SUPER_USUARIO, hiredAt: new Date('2026-01-01'), passwordHash } });
  const customer = await prisma.customer.upsert({ where: { id: '00000000-0000-0000-0000-000000000001' }, update: {}, create: { id: '00000000-0000-0000-0000-000000000001', name: 'Cliente de Prueba', phone: '7000-0000', dui: '00000000-1', address: 'San Salvador' } });
  await prisma.product.upsert({ where: { sku: 'REP-001' }, update: {}, create: { sku: 'REP-001', name: 'Aceite sintetico 5W-30', type: ProductType.PRODUCTO, stock: 20, purchasePrice: 25, salePrice: 35, classification: 'Lubricantes', minimumStock: 5, maximumStock: 50, description: 'Producto de prueba local' } });
  await prisma.product.upsert({ where: { sku: 'SRV-001' }, update: {}, create: { sku: 'SRV-001', name: 'Diagnostico computarizado', type: ProductType.SERVICIO, salePrice: 20, classification: 'Servicios', minimumStock: 0, maximumStock: 0 } });
  console.log(`Seed listo. Usuario: ${user.dui}, cliente: ${customer.name}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());