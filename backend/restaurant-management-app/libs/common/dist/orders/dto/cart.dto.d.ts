import { OrderType } from '../../kafka/constants/events';
export declare class AddToCartDto {
    quantity: number;
    specialInstructions?: string;
}
export declare class UpdateCartItemDto {
    quantity: number;
    specialInstructions?: string;
}
export declare class DeliveryAddressDto {
    street: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
    deliveryInstructions?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export declare class SetOrderTypeDto {
    orderType: OrderType;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddressDto;
    takeawayPhone?: string;
    takeawayName?: string;
}
export declare class CartItemResponseDto {
    productId: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}
export declare class CartResponseDto {
    _id: string;
    customerId: string;
    restaurantId: string;
    items: CartItemResponseDto[];
    totalAmount: number;
    orderType?: OrderType;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddressDto;
    takeawayPhone?: string;
    takeawayName?: string;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=cart.dto.d.ts.map