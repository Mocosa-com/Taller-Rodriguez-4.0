import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductType } from '@prisma/client';
import { ProductsService } from './products.service';
import { CurrentUser } from '../../common/auth/auth.decorator';
import { AuthUser } from '../../common/auth/auth.types';
class ProductDto { @IsString() sku!: string; @IsString() name!: string; @IsEnum(ProductType) type!: ProductType; @IsNumber() @Min(0) purchasePrice!: number; @IsNumber() @Min(0) salePrice!: number; @IsNumber() @Min(0) minimumStock!: number; @IsNumber() @Min(0) maximumStock!: number; @IsString() classification!: string; @IsOptional() @IsString() supplierId?: string; @IsOptional() @IsString() description?: string; }
class StockAdjustmentDto { @IsNumber() quantity!: number; @IsString() reason!: string; }
@Controller('products') export class ProductsController {
  constructor(private readonly service: ProductsService) {}
  @Get() list(@Query('search') search?: string, @Query('lowStock') lowStock?: string) { return this.service.list(search, lowStock === 'true'); }
  @Post() create(@Body() body: ProductDto) { return this.service.create(body as unknown as Record<string, unknown>); }
  @Get(':id') find(@Param('id') id: string) { return this.service.find(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: Partial<ProductDto>) { return this.service.update(id, body as Record<string, unknown>); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/stock-adjustments') adjust(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() body: StockAdjustmentDto) { return this.service.adjustStock(id, body.quantity, user.id, body.reason); }
}