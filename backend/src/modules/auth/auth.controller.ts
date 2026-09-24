import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { CurrentUser, Public } from '../../common/auth/auth.decorator';
import { AuthUser } from '../../common/auth/auth.types';
import { AuthService } from './auth.service';

class LoginDto { @IsString() identifier!: string; @IsString() @MinLength(8) password!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Public() @Post('login') login(@Body() body: LoginDto) { return this.service.login(body.identifier, body.password); }
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.service.me(user.id); }
}