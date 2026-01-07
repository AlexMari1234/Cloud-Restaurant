import { OrderStatusEnum, OrderTypeEnum } from '../../kafka/constants/enums';
export type OrderType = typeof OrderTypeEnum[keyof typeof OrderTypeEnum];
export type OrderStatus = typeof OrderStatusEnum[keyof typeof OrderStatusEnum];
export declare class DeliveryAddress {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export declare class OrderItem {
    productId: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}
export declare class CreateOrderDto {
    orderType: OrderType;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddress;
    items: OrderItem[];
}
export declare class OrderResponseDto {
    _id: string;
    restaurantId: string;
    customerId: string;
    orderType: OrderType;
    status: OrderStatus;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddress;
    items: OrderItem[];
    totalAmount: number;
    waiterId?: string;
    driverId?: string;
    kitchenNotes?: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type OrderEvent = {
    orderId: string;
    restaurantId: string;
    customerId: string;
    status: OrderStatus;
    timestamp: Date;
    metadata?: Record<string, any>;
};
//# sourceMappingURL=order.dto.d.ts.map