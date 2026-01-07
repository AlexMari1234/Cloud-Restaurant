export declare class DeliveryTakeawayOrderItemDto {
    productId: string;
    quantity: number;
    specialInstructions?: string;
}
export declare class CreateDeliveryOrderDto {
    restaurantId: string;
    items: DeliveryTakeawayOrderItemDto[];
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderNotes?: string;
}
export declare class CreateTakeawayOrderDto {
    restaurantId: string;
    items: DeliveryTakeawayOrderItemDto[];
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    orderNotes?: string;
}
export declare class UpdateDeliveryStatusDto {
    status: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    note?: string;
}
export declare class UpdateTakeawayStatusDto {
    status: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP';
    note?: string;
}
export declare class KitchenAcceptDeliveryOrderDto {
    estimatedPrepTime: string;
    note?: string;
}
export declare class KitchenAcceptTakeawayOrderDto {
    estimatedPrepTime: string;
    note?: string;
}
export declare class KitchenStartPreparingDeliveryOrderDto {
    note?: string;
}
export declare class KitchenStartPreparingTakeawayOrderDto {
    note?: string;
}
export declare class KitchenMarkReadyDeliveryOrderDto {
    note?: string;
}
export declare class KitchenMarkReadyTakeawayOrderDto {
    note?: string;
}
export declare class CompleteDeliveryOrderDto {
    driverId?: string;
    note?: string;
}
export declare class CompleteTakeawayOrderDto {
    waiterId?: string;
    note?: string;
}
//# sourceMappingURL=delivery-takeaway.dto.d.ts.map