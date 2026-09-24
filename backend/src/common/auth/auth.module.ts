import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [JwtGuard, { provide: APP_GUARD, useClass: JwtGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
  exports: [JwtGuard],
})
export class AuthCommonModule {}