import { NestFactory } from '@nestjs/core';
import { WebSocketGatewayModule } from './websocket-gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(WebSocketGatewayModule);

  // Enable CORS pentru front-end, Kong și WS direct
  app.enableCors({
    origin: [
      'http://localhost:3010',
      'http://localhost:8000',
      'ws://localhost:3005',
      'ws://localhost:8000'
    ],
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  });

  // Conectare Kafka ca microservice (consumator)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'websocket-gateway-server',
        brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
      },
      consumer: {
        groupId: 'websocket-gateway-server',
        allowAutoTopicCreation: true,
      },
      subscribe: { fromBeginning: false },
    },
  });

  console.log('🔄 Attempting to connect to Kafka…');
  await app.startAllMicroservices();
  console.log('✅ Kafka microservice connected – listening for events');

  const port = process.env.WEBSOCKET_GATEWAY_PORT || 3005;
  await app.listen(port);
  console.log(`🚀 WebSocket Gateway running on port ${port}`);
}

bootstrap();
