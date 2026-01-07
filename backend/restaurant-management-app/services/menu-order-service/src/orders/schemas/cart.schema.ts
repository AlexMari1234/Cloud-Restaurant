import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderItem } from '@rm/common';

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ required: true, type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: String })
  specialInstructions?: string;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, type: Types.ObjectId })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ type: [{ 
    productId: { type: Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    specialInstructions: String
  }]})
  items: CartItem[];

  @Prop({ required: true, type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: Number })
  tableNumber?: number;

  @Prop({ type: Object })
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

  @Prop({ type: String, enum: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'] })
  orderType?: 'DINE_IN' | 'DELIVERY' | 'TAKEAWAY';

  // Takeaway specific fields
  @Prop({ type: String })
  takeawayPhone?: string;

  @Prop({ type: String })
  takeawayName?: string;

  @Prop({ type: Date, default: Date.now, expires: 3600 }) // Cart expires after 1 hour
  lastUpdated: Date;
}

export interface CartDocument extends Cart, Document {
  createdAt: Date;
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart); 