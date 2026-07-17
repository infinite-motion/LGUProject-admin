import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Enable Cookie Parsing
  app.use(cookieParser());
  
  // 2. Enable CORS specifically for the frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // This is REQUIRED for the browser to accept HttpOnly cookies from the backend
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
