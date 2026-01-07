export interface BaseOrderEvent {
    orderId: string;
    restaurantId: string;
    customerId: string;
    orderType: 'DELIVERY' | 'TAKEAWAY';
    status: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface DeliveryTakeawayOrderItem {
    productId: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
    status: string;
}
export interface DeliveryOrderCreatedEvent extends BaseOrderEvent {
    orderType: 'DELIVERY';
    status: 'PENDING';
    items: DeliveryTakeawayOrderItem[];
    metadata: {
        deliveryAddress: string;
        customerPhone: string;
        totalAmount: number;
    };
}
export interface DeliveryOrderKitchenAcceptedEvent extends BaseOrderEvent {
    orderType: 'DELIVERY';
    status: 'KITCHEN_ACCEPTED';
    metadata: {
        chefId: string;
        acceptedItems: string[];
        acceptedAt: Date;
    };
}
export interface DeliveryOrderStatusUpdatedEvent extends BaseOrderEvent {
    orderType: 'DELIVERY';
    metadata: {
        oldStatus: string;
        newStatus: string;
        chefId: string;
        timestamp: Date;
    };
}
export interface OrderDeliveredEvent extends BaseOrderEvent {
    orderType: 'DELIVERY';
    status: 'DELIVERED';
    metadata: {
        totalAmount: number;
        driverId?: string;
        deliveredAt: Date;
    };
}
export interface TakeawayOrderCreatedEvent extends BaseOrderEvent {
    orderType: 'TAKEAWAY';
    status: 'PENDING';
    items: DeliveryTakeawayOrderItem[];
    metadata: {
        customerPhone: string;
        totalAmount: number;
    };
}
export interface TakeawayOrderKitchenAcceptedEvent extends BaseOrderEvent {
    orderType: 'TAKEAWAY';
    status: 'KITCHEN_ACCEPTED';
    metadata: {
        chefId: string;
        acceptedItems: string[];
        acceptedAt: Date;
    };
}
export interface TakeawayOrderStatusUpdatedEvent extends BaseOrderEvent {
    orderType: 'TAKEAWAY';
    metadata: {
        oldStatus: string;
        newStatus: string;
        chefId: string;
        timestamp: Date;
    };
}
export interface OrderCompletedEvent extends BaseOrderEvent {
    orderType: 'TAKEAWAY';
    status: 'PICKED_UP';
    metadata: {
        totalAmount: number;
        waiterId?: string;
        pickedUpAt: Date;
    };
}
export type DeliveryOrderEvent = DeliveryOrderCreatedEvent | DeliveryOrderKitchenAcceptedEvent | DeliveryOrderStatusUpdatedEvent | OrderDeliveredEvent;
export type TakeawayOrderEvent = TakeawayOrderCreatedEvent | TakeawayOrderKitchenAcceptedEvent | TakeawayOrderStatusUpdatedEvent | OrderCompletedEvent;
export type DeliveryTakeawayOrderEvent = DeliveryOrderEvent | TakeawayOrderEvent;
//# sourceMappingURL=delivery-takeaway.events.d.ts.map