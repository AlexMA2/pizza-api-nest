import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // I need this middleware so NestJS can read cookies from incoming requests.
  // Without it, request.cookies would always be undefined — the refresh token endpoint wouldn't work.
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
