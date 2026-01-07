import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KitchenResponsesController } from '../restaurants/kafka/kitchen-responses.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'restaurant-service-client',
              brokers: [configService.get<string>('KAFKA_BROKER', 'kafka:29092')],
            },
            consumer: {
              groupId: 'restaurant-consumer',
            },
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [KitchenResponsesController],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {} 