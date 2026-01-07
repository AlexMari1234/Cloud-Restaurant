import { OrderTopic } from './topics';
import { OrderTypeEnum, OrderStatusEnum } from './enums';

export type OrderType = typeof OrderTypeEnum[keyof typeof OrderTypeEnum];
export type OrderStatus = typeof OrderStatusEnum[keyof typeof OrderStatusEnum];

export interface OrderItem {
  productId: string; // MongoDB ObjectId as string
  quantity: number;
  price: number;
  specialInstructions?: string;
  status: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  phoneNumber?: string;
  deliveryInstructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OrderMetadata {
  tableNumber?: number;
  waiterId?: string; // MongoDB ObjectId as string
  driverId?: string; // MongoDB ObjectId as string
  chefId?: string; // MongoDB ObjectId as string
  kitchenNotes?: string;
  estimatedTime?: number;
  actualDeliveryTime?: Date;
  deliveryAddress?: DeliveryAddress;
  totalAmount?: number;
  customerEmail?: string;
  customerPhone?: string;
  orderNotes?: string;
}

export interface OrderEvent {
  orderId: string; // MongoDB ObjectId as string
  restaurantId: string; // MongoDB ObjectId as string
  customerId: string; // MongoDB ObjectId as string
  orderType: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
  status: string;
  timestamp: Date;
  items?: OrderItem[];
  metadata: OrderMetadata;
}

// Specific event types for better type safety
export interface NewOrderEvent extends OrderEvent {
  status: 'PENDING';
  items: OrderItem[];
  metadata: OrderMetadata & {
    deliveryAddress?: DeliveryAddress;
  };
}

export interface KitchenAcceptedEvent extends OrderEvent {
  status: 'KITCHEN_ACCEPTED';
  metadata: OrderMetadata & {
    estimatedTime: number;
  };
}

export interface PreparingEvent extends OrderEvent {
  status: 'PREPARING';
}

export interface ReadyEvent extends OrderEvent {
  status: 'READY';
}

export interface WaiterAcceptedEvent extends OrderEvent {
  status: 'WAITER_ACCEPTED';
  metadata: OrderMetadata & {
    waiterId: string; // MongoDB ObjectId as string
  };
}

export interface ServedEvent extends OrderEvent {
  status: 'SERVED';
}

export interface CompletedEvent extends OrderEvent {
  status: 'COMPLETED';
}

export interface ReadyForDeliveryEvent extends OrderEvent {
  status: 'READY_FOR_DELIVERY';
}

export interface DriverAcceptedEvent extends OrderEvent {
  status: 'DRIVER_ACCEPTED';
  metadata: OrderMetadata & {
    driverId: string; // MongoDB ObjectId as string
  };
}

export interface PickedUpEvent extends OrderEvent {
  status: 'IN_DELIVERY';
}

export interface DeliveredEvent extends OrderEvent {
  status: 'DELIVERED';
  metadata: OrderMetadata & {
    actualDeliveryTime: Date;
  };
}

export interface CancelledEvent extends OrderEvent {
  status: 'CANCELLED';
  metadata: OrderMetadata & {
    cancellationReason?: string;
  };
}

// Type guard functions
export function isNewOrderEvent(event: OrderEvent): event is NewOrderEvent {
  return event.status === 'PENDING';
}

export function isKitchenAcceptedEvent(event: OrderEvent): event is KitchenAcceptedEvent {
  return event.status === 'KITCHEN_ACCEPTED';
}

// ... similar type guards for other event types

// New Dine-in specific events with batch structure
export interface DineInOrderItem {
  productId: string; // MongoDB ObjectId as string
  quantity: number;
  price: number;
  specialInstructions?: string;
  itemStatus?: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
}

export interface DineInOrderBatch {
  batchNumber: number;
  batchStatus: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  batchNote?: string;
  items: DineInOrderItem[];
}

export interface DineInOrderCreatedEvent extends OrderEvent {
  status: 'DRAFT';
  batches: DineInOrderBatch[];
  metadata: OrderMetadata & {
    tableNumber: number;
    waiterId: string; // MongoDB ObjectId as string
    customerEmail: string;
  };
}

export interface BatchSentToKitchenEvent extends OrderEvent {
  status: 'PARTIAL_KITCHEN';
  metadata: OrderMetadata & {
    batchNumber: number;
    itemIds: string[]; // Item IDs in this batch
    sentAt: Date;
  };
}

export interface ItemStatusChangedEvent extends OrderEvent {
  metadata: OrderMetadata & {
    itemId: string;
    oldStatus: string;
    newStatus: string;
    chefId?: string; // MongoDB ObjectId as string
    timestamp: Date;
  };
}

export interface BatchReadyEvent extends OrderEvent {
  status: 'ALL_READY' | 'PARTIAL_SERVED';
  metadata: OrderMetadata & {
    batchNumber: number;
    readyItems: string[]; // Item IDs that are ready
    allItemsReady: boolean;
  };
}

export interface PaymentRequestedEvent extends OrderEvent {
  status: 'PAYMENT_REQUESTED';
  metadata: OrderMetadata & {
    waiterId: string; // MongoDB ObjectId as string
    totalAmount: number;
    note?: string;
  };
}

export interface DineInCompletedEvent extends OrderEvent {
  status: 'DINE_IN_COMPLETED';
  metadata: OrderMetadata & {
    waiterId: string; // MongoDB ObjectId as string
    totalAmount: number;
    paymentMethod: string;
    amountPaid: number;
    completedAt: Date;
  };
}

// ============================= TAKEAWAY EVENTS =============================

export interface TakeawayOrderCreatedEvent extends OrderEvent {
  status: 'PENDING';
  orderType: 'TAKEAWAY';
  items: OrderItem[];
  metadata: OrderMetadata & {
    customerPhone: string;
    customerName: string;
    totalAmount: number;
  };
}

export interface KitchenAcceptTakeawayEvent extends OrderEvent {
  status: 'KITCHEN_ACCEPTED';
  orderType: 'TAKEAWAY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    acceptedItems: string[]; // Product IDs
    acceptedAt: Date;
    note?: string;
    estimatedPrepTime?: string;
  };
}

export interface KitchenPreparingTakeawayEvent extends OrderEvent {
  status: 'PREPARING';
  orderType: 'TAKEAWAY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    preparationStartedAt: Date;
    note?: string;
  };
}

export interface KitchenReadyTakeawayEvent extends OrderEvent {
  status: 'READY';
  orderType: 'TAKEAWAY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    readyAt: Date;
    note?: string;
  };
}

export interface CustomerPickupTakeawayEvent extends OrderEvent {
  status: 'PICKED_UP';
  orderType: 'TAKEAWAY';
  metadata: OrderMetadata & {
    waiterId?: string; // MongoDB ObjectId as string
    pickedUpAt: Date;
    customerName?: string;
  };
}

// ============================= DELIVERY EVENTS =============================

export interface DeliveryOrderCreatedEvent extends OrderEvent {
  status: 'PENDING';
  orderType: 'DELIVERY';
  items: OrderItem[];
  metadata: OrderMetadata & {
    deliveryAddress: DeliveryAddress;
    customerPhone: string;
    customerName: string;
    totalAmount: number;
  };
}

export interface KitchenAcceptDeliveryEvent extends OrderEvent {
  status: 'KITCHEN_ACCEPTED';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    acceptedItems: string[]; // Product IDs
    acceptedAt: Date;
    note?: string;
    estimatedPrepTime?: string;
  };
}

export interface KitchenPreparingDeliveryEvent extends OrderEvent {
  status: 'PREPARING';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    preparationStartedAt: Date;
    note?: string;
  };
}

export interface KitchenReadyDeliveryEvent extends OrderEvent {
  status: 'READY_FOR_DELIVERY';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    chefId: string; // MongoDB ObjectId as string
    readyAt: Date;
    note?: string;
  };
}

export interface DriverAcceptDeliveryEvent extends OrderEvent {
  status: 'DRIVER_ACCEPTED';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    driverId: string; // MongoDB ObjectId as string
    acceptedAt: Date;
    estimatedDeliveryTime?: string; // e.g., "15-20 mins", "30 mins"
    note?: string;
  };
}

export interface DriverPickupDeliveryEvent extends OrderEvent {
  status: 'IN_DELIVERY';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    driverId: string; // MongoDB ObjectId as string
    pickedUpAt: Date;
    estimatedDeliveryTime?: string; // e.g., "15-20 mins", "30 mins"
    note?: string;
  };
}

export interface DriverDeliverOrderEvent extends OrderEvent {
  status: 'DELIVERED';
  orderType: 'DELIVERY';
  metadata: OrderMetadata & {
    driverId: string; // MongoDB ObjectId as string
    deliveredAt: Date;
    totalAmount: number;
  };
}

// ============================= NEW KAFKA-BASED DINE-IN EVENTS =============================

// Waiter Events
export interface WaiterCreateDineInEvent extends OrderEvent {
  status: 'PENDING';
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    tableNumber: number;
    waiterId: string;
    waiterEmail: string;
    customerName?: string;
    items: OrderItem[];
  };
}

export interface WaiterSendBatchEvent extends OrderEvent {
  status: 'SENT_TO_KITCHEN';
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    waiterId: string;
    batchNumber: number;
    items: OrderItem[];
    sentAt: Date;
    note?: string;
  };
}

export interface WaiterAddBatchEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    waiterId: string;
    batchNumber: number;
    items: OrderItem[];
    addedAt: Date;
    note?: string;
  };
}

export interface WaiterServeBatchEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    waiterId: string;
    batchNumber: number;
    servedAt: Date;
    note?: string;
  };
}

export interface WaiterRequestPaymentEvent extends OrderEvent {
  status: 'PAYMENT_REQUESTED';
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    waiterId: string;
    requestedAt: Date;
    note?: string;
  };
}

export interface WaiterCompletePaymentEvent extends OrderEvent {
  status: 'COMPLETED';
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    waiterId: string;
    completedAt: Date;
    paymentMethod: string;
    tip?: number;
    note?: string;
  };
}

// Kitchen Events
export interface KitchenAcceptBatchEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    chefId: string;
    batchNumber: number;
    acceptedAt: Date;
    estimatedPrepTime?: string;
    note?: string;
  };
}

export interface KitchenBatchPreparingEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    chefId: string;
    batchNumber: number;
    preparingAt: Date;
    note?: string;
  };
}

export interface KitchenBatchReadyEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    chefId: string;
    batchNumber: number;
    readyAt: Date;
    note?: string;
  };
}

export interface KitchenItemPreparingEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    chefId: string;
    batchNumber: number;
    productId: string;
    preparingAt: Date;
    note?: string;
  };
}

export interface KitchenItemReadyEvent extends OrderEvent {
  orderType: 'DINE_IN';
  metadata: OrderMetadata & {
    chefId: string;
    batchNumber: number;
    productId: string;
    readyAt: Date;
    note?: string;
  };
}

// ============================= Union Types =============================

// Dine-in event union types
export type DineInWaiterEvent = 
  | WaiterCreateDineInEvent
  | WaiterSendBatchEvent
  | WaiterAddBatchEvent
  | WaiterServeBatchEvent
  | WaiterRequestPaymentEvent
  | WaiterCompletePaymentEvent;

export type DineInKitchenEvent = 
  | KitchenAcceptBatchEvent
  | KitchenBatchPreparingEvent
  | KitchenBatchReadyEvent
  | KitchenItemPreparingEvent
  | KitchenItemReadyEvent;

export type DineInEvent = DineInWaiterEvent | DineInKitchenEvent;

// Takeaway event union types
export type TakeawayEvent = 
  | TakeawayOrderCreatedEvent
  | KitchenAcceptTakeawayEvent
  | KitchenPreparingTakeawayEvent
  | KitchenReadyTakeawayEvent
  | CustomerPickupTakeawayEvent;

// Delivery event union types  
export type DeliveryEvent = 
  | DeliveryOrderCreatedEvent
  | KitchenAcceptDeliveryEvent
  | KitchenPreparingDeliveryEvent
  | KitchenReadyDeliveryEvent
  | DriverAcceptDeliveryEvent
  | DriverPickupDeliveryEvent
  | DriverDeliverOrderEvent;

// All event types
export type AllOrderEvents = DineInEvent | TakeawayEvent | DeliveryEvent;

// ============================= Request/Response Events =============================

// Request events for kitchen orders
export interface KitchenGetPendingOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetPendingOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface KitchenGetDineInPendingRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetDineInPendingResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual dine-in order data
  success: boolean;
  error?: string;
}

export interface KitchenGetActiveOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetActiveOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface KitchenGetAcceptedOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetAcceptedOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface KitchenGetDineInAcceptedRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetDineInAcceptedResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual dine-in order data
  success: boolean;
  error?: string;
}

export interface KitchenGetReadyTakeawayRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetReadyTakeawayResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual takeaway order data
  success: boolean;
  error?: string;
}

export interface KitchenGetReadyDeliveryRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetReadyDeliveryResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual delivery order data
  success: boolean;
  error?: string;
}

export interface KitchenGetPendingDeliveryRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetPendingDeliveryResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual delivery order data
  success: boolean;
  error?: string;
}

export interface KitchenGetInProgressDeliveryRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetInProgressDeliveryResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual delivery order data
  success: boolean;
  error?: string;
}

export interface KitchenGetPendingTakeawayRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetPendingTakeawayResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual takeaway order data
  success: boolean;
  error?: string;
}

export interface KitchenGetDineInReadyRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface KitchenGetDineInReadyResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual dine-in ready order data
  success: boolean;
  error?: string;
}

// Request events for waiter orders
export interface WaiterGetAllOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface WaiterGetAllOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface WaiterGetReadyBatchesRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface WaiterGetReadyBatchesResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data with ready batches
  success: boolean;
  error?: string;
}

export interface WaiterGetCurrentOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface WaiterGetCurrentOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface WaiterGetCompletedOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface WaiterGetCompletedOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual order data
  success: boolean;
  error?: string;
}

export interface WaiterGetReadyTakeawayRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface WaiterGetReadyTakeawayResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual takeaway order data
  success: boolean;
  error?: string;
}

// Request events for driver orders
export interface DriverGetReadyOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface DriverGetReadyOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual delivery order data
  success: boolean;
  error?: string;
}

export interface DriverGetAssignedOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface DriverGetAssignedOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual delivery order data
  success: boolean;
  error?: string;
}

export interface DriverGetCompletedOrdersRequestEvent {
  requestId: string;
  restaurantId: string;
  driverId: string; // Filter by specific driver ID
  timestamp: Date;
  metadata?: {
    token?: string;
    userId?: string;
  };
}

export interface DriverGetCompletedOrdersResponseEvent {
  requestId: string;
  restaurantId: string;
  driverId: string;
  timestamp: Date;
  orders: any[]; // Will contain the actual completed delivery order data
  success: boolean;
  error?: string;
}

// Union types for request/response events
export type KitchenRequestEvent = 
  | KitchenGetPendingOrdersRequestEvent
  | KitchenGetDineInPendingRequestEvent
  | KitchenGetActiveOrdersRequestEvent
  | KitchenGetAcceptedOrdersRequestEvent
  | KitchenGetDineInAcceptedRequestEvent
  | KitchenGetReadyTakeawayRequestEvent
  | KitchenGetReadyDeliveryRequestEvent
  | KitchenGetPendingDeliveryRequestEvent
  | KitchenGetInProgressDeliveryRequestEvent
  | KitchenGetPendingTakeawayRequestEvent
  | KitchenGetDineInReadyRequestEvent;

export type KitchenResponseEvent = 
  | KitchenGetPendingOrdersResponseEvent
  | KitchenGetDineInPendingResponseEvent
  | KitchenGetActiveOrdersResponseEvent
  | KitchenGetAcceptedOrdersResponseEvent
  | KitchenGetDineInAcceptedResponseEvent
  | KitchenGetReadyTakeawayResponseEvent
  | KitchenGetReadyDeliveryResponseEvent
  | KitchenGetPendingDeliveryResponseEvent
  | KitchenGetInProgressDeliveryResponseEvent
  | KitchenGetPendingTakeawayResponseEvent
  | KitchenGetDineInReadyResponseEvent;

export type WaiterRequestEvent = 
  | WaiterGetAllOrdersRequestEvent
  | WaiterGetReadyBatchesRequestEvent
  | WaiterGetCurrentOrdersRequestEvent
  | WaiterGetCompletedOrdersRequestEvent
  | WaiterGetReadyTakeawayRequestEvent;

export type WaiterResponseEvent = 
  | WaiterGetAllOrdersResponseEvent
  | WaiterGetReadyBatchesResponseEvent
  | WaiterGetCurrentOrdersResponseEvent
  | WaiterGetCompletedOrdersResponseEvent
  | WaiterGetReadyTakeawayResponseEvent;

export type DriverRequestEvent = 
  | DriverGetReadyOrdersRequestEvent
  | DriverGetAssignedOrdersRequestEvent
  | DriverGetCompletedOrdersRequestEvent;

export type DriverResponseEvent = 
  | DriverGetReadyOrdersResponseEvent
  | DriverGetAssignedOrdersResponseEvent
  | DriverGetCompletedOrdersResponseEvent; 