import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/auth/auth.decorator';
@Controller('health') export class HealthController { @Public() @Get() check() { return { status: 'ok', service: 'taller-rodriguez-api' }; } }