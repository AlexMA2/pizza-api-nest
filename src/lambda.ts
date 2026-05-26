import type { Handler, Context, Callback } from 'aws-lambda'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import configure from '@vendia/serverless-express'

//Allows warm starts, if two petitions came at the same time, both are handled in the same lambda container
let cachedServer: Handler

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  //Check if the server is already running, if not, create it
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule)

    nestApp.enableCors({
      origin: [
        'http://localhost:4200',
        'http://127.0.0.1:4200'
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Authorization',
    });
    //Force nest to load all modules
    await nestApp.init()
    //Adapts nest to serverless-express
    cachedServer = configure({
      app: nestApp.getHttpAdapter().getInstance(),
      // To handle binary data such as images or pdf files
      binaryMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
      // Other possible configurations
      // more binary settings
      // caching configuration
      // global prefix
    })
  }
  return cachedServer(event, context, callback)
}