import { Document, Types } from 'mongoose';
import { OrderType, OrderStatus, DeliveryAddress } from '@rm/common';
interface OrderItemMongo {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    specialInstructions?: string;
    status?: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PICKED_UP';
    sentToKitchenAt?: Date;
    kitchenAcceptedAt?: Date;
    preparationStartedAt?: Date;
    readyAt?: Date;
    completedAt?: Date;
    chefId?: Types.ObjectId;
}
interface OrderBatchItemMongo {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    specialInstructions?: string;
    itemStatus?: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
    sentToKitchenAt?: Date;
    kitchenAcceptedAt?: Date;
    preparationStartedAt?: Date;
    readyAt?: Date;
    servedAt?: Date;
    chefId?: Types.ObjectId;
}
interface OrderBatchMongo {
    batchNumber: number;
    items: OrderBatchItemMongo[];
    batchStatus: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
    batchNote?: string;
    sentToKitchenAt?: Date;
    kitchenAcceptedAt?: Date;
    allItemsReadyAt?: Date;
    allItemsServedAt?: Date;
    chefId?: Types.ObjectId;
    preparationStartedAt?: Date;
    readyAt?: Date;
}
export declare class Order {
    restaurantId: Types.ObjectId;
    customerId: Types.ObjectId;
    orderType: OrderType;
    status: OrderStatus;
    tableNumber?: number;
    deliveryAddress?: DeliveryAddress;
    items?: OrderItemMongo[];
    batches?: OrderBatchMongo[];
    totalAmount: number;
    chefId?: Types.ObjectId;
    waiterId?: Types.ObjectId;
    kitchenDetails?: {
        chefId?: Types.ObjectId;
        assistantChefId?: Types.ObjectId;
        sentToKitchenAt?: Date;
        acceptedAt?: Date;
        preparationStartedAt?: Date;
        readyAt?: Date;
        notes?: string;
        estimatedPrepTime?: string;
    };
    deliveryDetails?: {
        driverId?: Types.ObjectId;
        acceptedAt?: Date;
        readyAt?: Date;
        pickedUpAt?: Date;
        deliveredAt?: Date;
        estimatedDeliveryTime?: number;
        actualDeliveryTime?: number;
        notes?: string;
    };
    takeawayDetails?: {
        waiterId?: Types.ObjectId;
        readyAt?: Date;
        pickedUpAt?: Date;
        customerName?: string;
        customerPhone?: string;
        notes?: string;
    };
    cancellationReason?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    orderNotes?: string;
    waiterNotes?: string;
    takeawayPhone?: string;
    takeawayName?: string;
    paymentStatus?: 'PENDING' | 'REQUESTED' | 'COMPLETED';
    updatedAt?: Date;
}
export type OrderDocument = Order & Document;
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order> & Order & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
}>;
export {};
