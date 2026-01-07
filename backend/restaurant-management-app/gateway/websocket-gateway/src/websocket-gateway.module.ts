import { Module } from '@nestjs/common';
import { KitchenWebSocketGateway, DriverWebSocketGateway, CustomerWebSocketGateway }   from './websocket.gateway';
import { KafkaEventsController }     from './kafka-events.controller';

@Module({
  imports:     [],
  controllers: [ KafkaEventsController ],
  providers:   [ KitchenWebSocketGateway, DriverWebSocketGateway, CustomerWebSocketGateway  ],
})
export class WebSocketGatewayModule {}
