import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VehiclesService } from './vehicles.service';
class VehicleDto { @IsString() customerId!: string; @IsString() plate!: string; @IsString() make!: string; @IsString() model!: string; @IsInt() @Min(1900) modelYear!: number; @IsOptional() @IsString() diagnosis?: string; @IsOptional() @IsString() assignedMechanicId?: string; }
@Controller('vehicles') export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}
  @Get() list(@Query('customerId') customerId?: string) { return this.service.list(customerId); }
  @Post() create(@Body() body: VehicleDto) { return this.service.create(body as unknown as Record<string, unknown>); }
  @Get(':id') find(@Param('id') id: string) { return this.service.find(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: Partial<VehicleDto>) { return this.service.update(id, body as Record<string, unknown>); }
  @Post(':id/deliver') deliver(@Param('id') id: string) { return this.service.deliver(id); }
}