import { Document, Types } from 'mongoose';
export declare class CartItem {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
    specialInstructions?: string;
}
export declare class Cart {
    customerId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    items: CartItem[];
    totalAmount: number;
    tableNumber?: number;
    deliveryAddress?: {
        street: string;
        city: string;
        postalCode: string;
        phoneNumber: string;
        deliveryInstructions?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    orderType?: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';
    takeawayPhone?: string;
    takeawayName?: string;
    lastUpdated: Date;
}
export interface CartDocument extends Cart, Document {
    createdAt: Date;
    updatedAt: Date;
}
export declare const CartSchema: import("mongoose").Schema<Cart, import("mongoose").Model<Cart, any, any, any, Document<unknown, any, Cart> & Cart & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Cart, Document<unknown, {}, import("mongoose").FlatRecord<Cart>> & import("mongoose").FlatRecord<Cart> & {
    _id: Types.ObjectId;
}>;
