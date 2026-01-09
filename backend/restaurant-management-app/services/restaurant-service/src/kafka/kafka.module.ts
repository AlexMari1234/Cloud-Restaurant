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
              connectionTimeout: 30000,
              requestTimeout: 60000,
              retry: {
                initialRetryTime: 2000,
                retries: 20,
                multiplier: 1.5,
                maxRetryTime: 30000,
              },
              maxInFlightRequests: 1,
              enforceRequestTimeout: false,
              metadataMaxAge: 300000,
            },
            consumer: {
              groupId: 'restaurant-consumer',
              retry: {
                initialRetryTime: 2000,
                retries: 20,
                multiplier: 1.5,
                maxRetryTime: 30000,
              },
            },
            producer: {
              allowAutoTopicCreation: true,
              retry: {
                initialRetryTime: 2000,
                retries: 20,
                multiplier: 1.5,
                maxRetryTime: 30000,
              },
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