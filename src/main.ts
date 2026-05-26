import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // SECURE & production-ready CORS configuration using environment variables.
  // We read the CORS_ORIGIN env variable (e.g. from .env or AWS ECS) and split it by comma
  // to dynamically allow only trusted production URLs plus local development hosts if needed.
  const allowedOriginsString = process.env.CORS_ORIGIN || 'http://localhost:4200';
  const allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());

  logger.log(`Initializing CORS with allowed origins: ${JSON.stringify(allowedOrigins)}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With',
  });

  // Enable cookie-parser middleware so NestJS can read cookies from incoming requests.
  // Crucial for secure JWT refresh tokens stored as HttpOnly, SameSite=Strict cookies.
  app.use(cookieParser());

  // Global prefix to keep api namespace separate (e.g. /api/users)
  // This is highly recommended when combining UI and API paths or using AWS API Gateway routes.
  app.setGlobalPrefix('api');

  // Enable shutdown hooks gracefully to terminate TypeORM database connections
  // and clean up resources when the Docker container or server receives a SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  logger.log(`Server starting on port ${port}...`);
  await app.listen(port);
}
bootstrap();
