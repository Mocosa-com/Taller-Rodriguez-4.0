import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CurrentUser } from '../../common/auth/auth.decorator';
import { AuthUser } from '../../common/auth/auth.types';
import { CashService } from './cash.service';
class OpenDto { @IsNumber() @Min(0) openingAmount!: number; }
class CloseDto { @IsNumber() @Min(0) countedAmount!: number; @IsOptional() @IsString() notes?: string; }
@Controller('cash') export class CashController {
  constructor(private readonly service: CashService) {}
  @Get('active') active() { return this.service.active(); }
  @Get('shifts') list() { return this.service.list(); }
  @Post('shifts') open(@CurrentUser() user: AuthUser, @Body() body: OpenDto) { return this.service.open(user.id, body.openingAmount); }
  @Post('shifts/:id/close') close(@Param('id') id: string, @Body() body: CloseDto) { return this.service.close(id, body.countedAmount, body.notes); }
}