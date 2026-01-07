import { OrderType, DeliveryAddress } from '../../kafka/constants/events';
export declare class OrderItemDto {
    productId: string;
    quantity: number;
    specialInstructions?: string;
}
export declare class CreateOrderDto {
    orderType: OrderType;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddress;
    takeawayPhone?: string;
    takeawayName?: string;
    items: OrderItemDto[];
    orderNotes?: string;
}
export declare class DeliveryAddressDto implements DeliveryAddress {
    street: string;
    city: string;
    postalCode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
//# sourceMappingURL=create-order.dto.d.ts.map