export * as AuthDto          from './auth';
export * as RestaurantsDto   from './restaurants';
export * as ReservationsDto  from './reservations';
export * from './menu';

// Auth exports
export * from './auth/guards/jwt-auth.guard';
export * from './auth/guards/roles.guard';
export * from './auth/decorators/roles.decorator';

// Export all DTOs and types
export * from './menu/dto/menu.dto';
export * from './menu/dto/category.dto';
export * from './menu/dto/product.dto';

// Auth exports
export * from './auth/user.dto';
export * from './auth/login.dto';
export * from './auth/register.dto';
export * from './auth/boolean.dto';

// Kafka constants exports
export { ORDER_TOPICS } from './kafka/constants/topics';
export { OrderStatusEnum, OrderTypeEnum, ItemStatusEnum } from './kafka/constants/enums';

// Orders exports
export {
  OrderType,
  OrderStatus,
  DeliveryAddress,
  OrderItem,
  OrderResponseDto,
  OrderEvent
} from './orders/dto/order.dto';

// Kafka events exports
export {
  DineInOrderCreatedEvent,
  BatchSentToKitchenEvent,
  ItemStatusChangedEvent,
  PaymentRequestedEvent,
  DineInCompletedEvent,
  DineInOrderItem,
  // New dine-in events
  WaiterCreateDineInEvent,
  WaiterSendBatchEvent,
  WaiterAddBatchEvent,
  WaiterServeBatchEvent,
  WaiterRequestPaymentEvent,
  WaiterCompletePaymentEvent,
  KitchenAcceptBatchEvent,
  KitchenBatchPreparingEvent,
  KitchenBatchReadyEvent,
  KitchenItemPreparingEvent,
  KitchenItemReadyEvent,
  // Takeaway events
  TakeawayOrderCreatedEvent,
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  CustomerPickupTakeawayEvent,
  // Delivery events
  DeliveryOrderCreatedEvent,
  KitchenAcceptDeliveryEvent,
  KitchenPreparingDeliveryEvent,
  KitchenReadyDeliveryEvent,
  DriverAcceptDeliveryEvent,
  DriverPickupDeliveryEvent,
  DriverDeliverOrderEvent
} from './kafka/constants/events';

// Additional order DTOs
export { CreateOrderDto } from './orders/dto/create-order.dto';

// Cart exports
export * from './orders/dto/cart.dto';

// Order creation exports
export * from './orders/dto/create-order-client.dto';

// Order assignment exports
export * from './orders/dto/order-assignment.dto';

// Kitchen operations exports
export * from './orders/dto/kitchen.dto';
export * from './orders/dto/delivery-takeaway.dto';

// Driver operations exports
export * from './orders/dto/driver.dto';

// Orders management exports
export * from './orders/dto/orders-management.dto';

// Waiter operations exports
export * from './orders/dto/waiter.dto';

// Auth exports
export * from './auth/get-user-by-email.dto';

// Restaurants exports
export { GeoDTO } from './restaurants/create-restaurant.dto';
export * from './restaurants/create-restaurant.dto';
export * from './restaurants/update-restaurant.dto';
export * from './restaurants/create-table.dto';
export * from './restaurants/update-table.dto';
export * from './restaurants/create-employee.dto';
export * from './restaurants/update-employee.dto';
export * from './restaurants/assign-manager.dto';

// Reservations exports
export {
  CreateReservationDTO,
  UpdateReservationDTO,
  GetAvailableTimeSlotsDTO
} from './reservations';

// Kitchen request/response events exports
export {
  KitchenGetPendingOrdersRequestEvent,
  KitchenGetPendingOrdersResponseEvent,
  KitchenGetDineInPendingRequestEvent,
  KitchenGetDineInPendingResponseEvent,
  KitchenGetActiveOrdersRequestEvent,
  KitchenGetActiveOrdersResponseEvent,
  KitchenGetAcceptedOrdersRequestEvent,
  KitchenGetAcceptedOrdersResponseEvent,
  KitchenGetDineInAcceptedRequestEvent,
  KitchenGetDineInAcceptedResponseEvent,
  KitchenGetReadyTakeawayRequestEvent,
  KitchenGetReadyTakeawayResponseEvent,
  KitchenGetReadyDeliveryRequestEvent,
  KitchenGetReadyDeliveryResponseEvent,
  KitchenGetPendingDeliveryRequestEvent,
  KitchenGetPendingDeliveryResponseEvent,
  KitchenGetInProgressDeliveryRequestEvent,
  KitchenGetInProgressDeliveryResponseEvent,
  KitchenGetPendingTakeawayRequestEvent,
  KitchenGetPendingTakeawayResponseEvent,
  KitchenGetDineInReadyRequestEvent,
  KitchenGetDineInReadyResponseEvent,
  KitchenRequestEvent,
  KitchenResponseEvent,
  // Waiter request/response events
  WaiterGetAllOrdersRequestEvent,
  WaiterGetAllOrdersResponseEvent,
  WaiterGetReadyBatchesRequestEvent,
  WaiterGetReadyBatchesResponseEvent,
  WaiterGetCurrentOrdersRequestEvent,
  WaiterGetCurrentOrdersResponseEvent,
  WaiterGetCompletedOrdersRequestEvent,
  WaiterGetCompletedOrdersResponseEvent,
  WaiterGetReadyTakeawayRequestEvent,
  WaiterGetReadyTakeawayResponseEvent,
  WaiterRequestEvent,
  WaiterResponseEvent,
  // Driver request/response events
  DriverGetReadyOrdersRequestEvent,
  DriverGetReadyOrdersResponseEvent,
  DriverGetAssignedOrdersRequestEvent,
  DriverGetAssignedOrdersResponseEvent,
  DriverGetCompletedOrdersRequestEvent,
  DriverGetCompletedOrdersResponseEvent,
  DriverRequestEvent,
  DriverResponseEvent
} from './kafka/constants/events';
