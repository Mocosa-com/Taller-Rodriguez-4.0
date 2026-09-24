import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { CustomersService } from './customers.service';

class CustomerDto { @IsString() @MinLength(2) name!: string; @IsString() phone!: string; @IsOptional() @IsString() dui?: string; @IsOptional() @IsEmail() email?: string; @IsString() address!: string; @IsOptional() @IsString() nit?: string; @IsOptional() @IsString() nrc?: string; @IsOptional() active?: boolean; }
@Controller('customers') export class CustomersController {
  constructor(private readonly service: CustomersService) {}
  @Get() list(@Query('search') search?: string) { return this.service.list(search); }
  @Post() create(@Body() body: CustomerDto) { return this.service.create(body as unknown as Record<string, unknown>); }
  @Get(':id') find(@Param('id') id: string) { return this.service.find(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: Partial<CustomerDto>) { return this.service.update(id, body as Record<string, unknown>); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}