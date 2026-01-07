import { NestFactory } from '@nestjs/core';
import { AuthAppModule } from './src/auth/auth-app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthAppModule);

  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: ['http://localhost:3010'],
  });

  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('API pentru autentificare')
    .setVersion('1.0')
    .addCookieAuth('jwt') // <== permite autentificare prin cookie
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Auth service running at http://localhost:3000`);
}
bootstrap();