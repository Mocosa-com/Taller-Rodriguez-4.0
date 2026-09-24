import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../../common/auth/auth.decorator';
import { AuthUser } from '../../common/auth/auth.types';
import { InvoicesService } from './invoices.service';
class InvoiceItemDto { @IsString() productId!: string; @IsNumber() @Min(0.001) quantity!: number; }
class InvoiceDto { @IsString() customerId!: string; @IsOptional() @IsString() vehicleId?: string; @IsEnum(['CONSUMIDOR_FINAL', 'CREDITO_FISCAL']) type!: 'CONSUMIDOR_FINAL' | 'CREDITO_FISCAL'; @IsOptional() @IsString() offerId?: string; @IsArray() @ValidateNested({ each: true }) @Type(() => InvoiceItemDto) items!: InvoiceItemDto[]; }
class AnnulDto { @IsString() reason!: string; }
@Controller('invoices') export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}
  @Get() list() { return this.service.list(); }
  @Post() create(@CurrentUser() user: AuthUser, @Body() body: InvoiceDto) { return this.service.create(user.id, body); }
  @Post(':id/annul') annul(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() body: AnnulDto) { return this.service.annul(id, user.id, body.reason); }
}