// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3010'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Reservation Service API')
    .setDescription('API pentru gestionarea rezervărilor')
    .setVersion('1.0')
    .addCookieAuth('jwt')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3002);
  console.log(`✅ Reservation service running at http://localhost:${process.env.PORT || 3002}/api`);
}
bootstrap();
