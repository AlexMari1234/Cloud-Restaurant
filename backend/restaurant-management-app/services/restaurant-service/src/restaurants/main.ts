import { NestFactory } from '@nestjs/core';
import { RestaurantMainModule } from './restaurant-main.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(RestaurantMainModule);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3000'],
  });

  const config = new DocumentBuilder()
    .setTitle('Restaurant Service API')
    .setDescription('API pentru gestionarea restaurantelor')
    .setVersion('1.0')
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Restaurant service running at http://localhost:3002/api`);
}
bootstrap();
