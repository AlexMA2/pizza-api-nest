import type { Handler, Context, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import configure from '@vendia/serverless-express';
import cookieParser = require('cookie-parser');
import { Logger } from '@nestjs/common';

// Warm start optimization: Keep a cached instance of the serverless express server.
// If another request hits the same warm container instance, we skip bootstrapping completely.
let cachedServer: Handler;
const logger = new Logger('LambdaBootstrap');

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  // Fix lambda path routing if needed for API Gateway proxy events
 
  event.path = event.rawPath || event.path;

  // 2. Asegura que NestJS vea el prefijo /api que configuraste
  if (event.path && !event.path.startsWith('/api')) {
    event.path = `/api${event.path}`;
  }

  // Create the Express instance inside the container if it does not exist yet (cold start)
  if (!cachedServer) {
    logger.log('Cold start detected! Bootstrapping NestJS application...');
    try {
      const nestApp = await NestFactory.create(AppModule);

      // Parse comma-separated list of allowed origins from environment variables.
      // E.g. CORS_ORIGIN="https://app.yourmenu.com,https://yourmenu.com"
      const allowedOriginsString = process.env.CORS_ORIGIN || 'http://localhost:4200';
      const allowedOrigins = allowedOriginsString.split(',').map(o => o.trim());

      // CORS Policy configuration on AWS Lambda
      nestApp.enableCors({
        origin: (origin, callbackFn) => {
          if (!origin) return callbackFn(null, true);
          if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callbackFn(null, true);
          } else {
            logger.warn(`Lambda CORS blocked origin: ${origin}`);
            callbackFn(new Error('Not allowed by CORS'));
          }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With',
      });

      // Crucial: cookie-parser is needed inside Lambda too to parse HttpOnly cookies for Auth sessions!
      nestApp.use(cookieParser());

      // Keep prefixes consistent with main.ts configurations.
      nestApp.setGlobalPrefix('api');

      // Warm start / eager module loading configuration
      await nestApp.init();

      // Configure serverless-express to wrap the Express app engine.
      cachedServer = configure({
        app: nestApp.getHttpAdapter().getInstance(),
        // Enable binary MIME types so files like avatars or menus can be loaded/uploaded
        binaryMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'multipart/form-data'],
      });
      
      logger.log('NestJS serverless-express server initialized successfully.');
    } catch (err) {
      logger.error('Failed to bootstrap NestJS application inside AWS Lambda container!', err);
      throw err;
    }
  }

  // Process the request through Serverless Express
  return await cachedServer(event, context, callback);
};