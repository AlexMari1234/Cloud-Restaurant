import { OrderType, OrderStatus, DeliveryAddress } from '../../kafka/constants/events';
export declare class OrderItemResponseDto {
    productId: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}
export declare class OrderResponseDto {
    _id: string;
    restaurantId: string;
    customerId: string;
    orderType: OrderType;
    status: OrderStatus;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddress;
    items: OrderItemResponseDto[];
    totalAmount: number;
    waiterId?: string;
    driverId?: string;
    kitchenNotes?: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=order-response.dto.d.ts.map