import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './filters/typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS - supports comma-separated origins in FRONTEND_URL
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:8080')
        .split(',')
        .map((o) => o.trim());

      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Normalize DB errors (e.g., unique constraints) into proper HTTP codes
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 VHL Import API running on port ${port}`);
}
bootstrap();
