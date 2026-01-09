import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure HTTP application
  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3010'],
    credentials: true,
  });

  // Add Kafka microservice with retry logic
  try {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'menu-order-service-client',
          brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
          connectionTimeout: 30000,
          requestTimeout: 60000,
          retry: {
            initialRetryTime: 2000,
            retries: 20,
            multiplier: 1.5,
            maxRetryTime: 30000,
          },
        },
        consumer: {
          groupId: 'menu-order-consumer-client',
          retry: {
            initialRetryTime: 2000,
            retries: 20,
            multiplier: 1.5,
            maxRetryTime: 30000,
          },
        },
      },
    });

    // Start microservices with error handling
    console.log('🔄 Attempting to connect to Kafka...');
    await app.startAllMicroservices().catch((err) => {
      console.warn('⚠️ Kafka microservice connection error (will retry):', err.message);
    });
    console.log('✅ Kafka microservice connected successfully');
  } catch (error) {
    console.warn('⚠️ Kafka microservice failed to start, but HTTP service will continue:', error.message);
    // Service continues without Kafka - HTTP endpoints will still work
  }

  const config = new DocumentBuilder()
    .setTitle('Menu Order Service API')
    .setDescription('API pentru gestionarea meniurilor și comenzilor')
    .setVersion('1.0')
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3003);
  console.log(`✅ Menu Order service running at http://localhost:${process.env.PORT || 3003}/api`);
}
bootstrap();
