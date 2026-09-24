import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');
  const origins = config.get<string>('CORS_ORIGIN', 'http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean);
  app.enableCors({ origin: origins.length === 1 ? origins[0] : origins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const swagger = new DocumentBuilder().setTitle('Taller Rodriguez API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(config.get<number>('PORT', 3001), '0.0.0.0');
}

void bootstrap();