export declare class WaiterAcceptOrderDto {
    note?: string;
}
export declare class WaiterServeOrderDto {
    note?: string;
}
export declare class WaiterCompleteOrderDto {
    note?: string;
}
export declare class CreateDineInOrderItemDto {
    productId: string;
    quantity: number;
    specialInstructions?: string;
}
export declare class CreateDineInOrderBatchDto {
    items: CreateDineInOrderItemDto[];
    batchNote?: string;
}
export declare class CreateDineInOrderDto {
    customerEmail: string;
    tableNumber: number;
    batches: CreateDineInOrderBatchDto[];
    orderNotes?: string;
    customerName?: string;
}
export declare class AddItemToOrderDto {
    productId: string;
    quantity: number;
    specialInstructions?: string;
}
export declare class SendBatchToKitchenDto {
    batchNumber: number;
    kitchenNote?: string;
}
export declare class KitchenAcceptBatchDto {
    batchNumber: number;
    note?: string;
}
export declare class UpdateBatchStatusDto {
    batchNumber: number;
    batchStatus: 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY';
    note?: string;
    itemStatuses?: {
        productId: string;
        status: string;
    }[];
}
export declare class ServeBatchDto {
    batchNumber: number;
    note?: string;
}
export declare class RequestPaymentDto {
    note?: string;
}
export declare class CompletePaymentDto {
    paymentMethod: 'CASH' | 'CARD' | 'DIGITAL';
    amountPaid: number;
    note?: string;
}
export declare class AddBatchToOrderDto {
    items: CreateDineInOrderItemDto[];
    batchNote?: string;
    sendToKitchen?: boolean;
}
//# sourceMappingURL=waiter.dto.d.ts.map