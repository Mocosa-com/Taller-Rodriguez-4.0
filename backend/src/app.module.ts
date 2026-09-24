import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthCommonModule } from './common/auth/auth.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { CashModule } from './modules/cash/cash.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, AuthCommonModule, AuthModule, CustomersModule, ProductsModule, CashModule, InvoicesModule, DashboardModule, HealthModule, VehiclesModule],
})
export class AppModule {}