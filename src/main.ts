// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  // Enhanced CORS configuration
  app.enableCors({
    origin: true, // Reflects the request origin or specify allowed origins: ['https://taja-fe.vercel.app', 'http://localhost:4200']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    credentials: true,
    maxAge: 86400, // OPTION preflight request cached for 24 hours
  });
  
  await app.listen(3000);
}
bootstrap();