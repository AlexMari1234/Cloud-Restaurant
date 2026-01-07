import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface KitchenUser {
  userId:      string;
  userName:    string;
  restaurantId:string;
  socketId:    string;
  role?:       string;
}

export interface DriverUser {
  userId:      string;
  userName:    string;
  restaurantId:string;
  socketId:    string;
  role:        'driver';
}

export interface CustomerUser {
  userId:      string;
  userName:    string;
  socketId:    string;
  role:        'customer' | 'user';
}

export interface NotificationMessage {
  id:           string;
  type:         string;
  restaurantId: string;
  orderId:      string;
  message:      string;
  timestamp:    Date;
  expiresAt:    Date;
  data?:        any;
}

@WebSocketGateway({
  namespace: '/kitchen',
  cors:      { origin: ['*'], credentials: true }
})
export class KitchenWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('✅ Kitchen WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`🔗 Kitchen client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Kitchen client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinKitchen')
  onJoin(
    @MessageBody() data: { userId:string; userName:string; restaurantId:string; role?:string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userName, restaurantId, role = 'chef' } = data;
    client.join(`restaurant-${restaurantId}`);
    client.join(`restaurant-${restaurantId}-${role}`);
    console.log(`👨‍🍳 ${userName} joined restaurant ${restaurantId} as ${role}`);
    client.emit('joinedKitchen', { success: true, restaurantId, role });
  }

  /** apelat de controllerul KafkaEventsController */
  public sendNotification(notification: NotificationMessage) {
    const room = `restaurant-${notification.restaurantId}`;
    console.log(`📣 Sending kitchen notification ${notification.id} → ${room}`);
    this.server.to(room).emit('notification', notification);
  }
}

@WebSocketGateway({
  namespace: '/driver',
  cors:      { origin: ['*'], credentials: true }
})
export class DriverWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('✅ Driver WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`🔗 Driver client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Driver client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinDriver')
  onJoin(
    @MessageBody() data: { userId:string; userName:string; restaurantId:string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userName, restaurantId } = data;
    client.join(`restaurant-${restaurantId}-drivers`);
    client.join(`driver-${data.userId}`);
    console.log(`🚗 Driver ${userName} joined restaurant ${restaurantId}`);
    client.emit('joinedDriver', { success: true, restaurantId });
  }

  /** apelat de controllerul KafkaEventsController pentru notificări driver */
  public sendDriverNotification(notification: NotificationMessage) {
    const room = `restaurant-${notification.restaurantId}-drivers`;
    console.log(`📣 Sending driver notification ${notification.id} → ${room}`);
    this.server.to(room).emit('notification', notification);
  }

  /** Notificare specifică pentru un driver anume */
  public sendPersonalDriverNotification(driverId: string, notification: NotificationMessage) {
    const room = `driver-${driverId}`;
    console.log(`📱 Sending personal driver notification ${notification.id} → ${room}`);
    this.server.to(room).emit('notification', notification);
  }
}

@WebSocketGateway({
  namespace: '/customer',
  cors:      { origin: ['*'], credentials: true }
})
export class CustomerWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('✅ Customer WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`🔗 Customer client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Customer client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCustomer')
  onJoin(
    @MessageBody() data: { userId:string; userName:string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userName, userId } = data;
    client.join(`customer-${userId}`);
    console.log(`👤 Customer ${userName} (${userId}) joined`);
    client.emit('joinedCustomer', { success: true, userId });
  }

  /** Notificare pentru un customer/user specific pentru tracking começi */
  public sendCustomerOrderNotification(customerId: string, notification: NotificationMessage) {
    const room = `customer-${customerId}`;
    console.log(`📱 Sending customer order notification ${notification.id} → ${room}`);
    
    // DEBUG: Check if anyone is in the room
    this.server.in(room).fetchSockets().then((connectedSockets) => {
      if (connectedSockets.length > 0) {
        console.log(`✅ Found ${connectedSockets.length} connected customer(s) in room ${room}`);
      } else {
        console.log(`⚠️ WARNING: No customers connected in room ${room}. Notification lost!`);
      }
    }).catch((error) => {
      console.error(`❌ Error checking connected customers in room ${room}:`, error);
    });
    
    this.server.to(room).emit('notification', notification);
  }
}
