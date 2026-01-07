import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderType, OrderStatus, DeliveryAddress } from '@rm/common';

// Local interfaces for MongoDB schema (with ObjectId)
// Simple item interface for traditional orders (delivery, takeaway)
interface OrderItemMongo {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  specialInstructions?: string;
  // Status tracking for delivery/takeaway items
  status?: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PICKED_UP';
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  preparationStartedAt?: Date;
  readyAt?: Date;
  completedAt?: Date;
  chefId?: Types.ObjectId;
}

// Enhanced item interface for dine-in batch items
interface OrderBatchItemMongo {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  specialInstructions?: string;
  // Item tracking fields for dine-in
  itemStatus?: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  preparationStartedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  chefId?: Types.ObjectId; // Chef who prepared this specific item
}

interface OrderBatchMongo {
  batchNumber: number; // Incremental: 1, 2, 3, etc.
  items: OrderBatchItemMongo[];
  batchStatus: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  batchNote?: string;
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  allItemsReadyAt?: Date;
  allItemsServedAt?: Date;
  chefId?: Types.ObjectId; // Chef responsible for this batch
  preparationStartedAt?: Date;
  readyAt?: Date;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  customerId: Types.ObjectId;

  @Prop({ required: true, enum: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'] })
  orderType: OrderType;

  @Prop({ required: true, enum: [
    'PENDING',
    'RESTAURANT_CONFIRMED',
    'KITCHEN_ACCEPTED',
    'PREPARING',
    'READY',
    'WAITER_ACCEPTED',
    'SERVED',
    'READY_FOR_DELIVERY',
    'DRIVER_ACCEPTED',
    'IN_DELIVERY',
    'DELIVERED',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'COMPLETED',
    'CANCELLED',
    'DRAFT',
    'PARTIAL_KITCHEN',
    'ALL_READY',
    'PARTIAL_SERVED',
    'PAYMENT_REQUESTED',
    'DINE_IN_COMPLETED'
  ]})
  status: OrderStatus;

  @Prop({ type: Number })
  tableNumber?: number;

  @Prop({ type: Object })
  deliveryAddress?: DeliveryAddress;

  // For traditional orders (delivery, takeaway)
  @Prop({ type: [{ 
    productId: { type: Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    specialInstructions: String,
    status: { type: String, enum: ['PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'PICKED_UP'] },
    sentToKitchenAt: Date,
    kitchenAcceptedAt: Date,
    preparationStartedAt: Date,
    readyAt: Date,
    completedAt: Date,
    chefId: Types.ObjectId
  }]})
  items?: OrderItemMongo[];

  // For dine-in orders with batch structure
  @Prop({ type: [{ 
    batchNumber: { type: Number, required: true },
    items: [{
      productId: { type: Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      specialInstructions: String,
      itemStatus: { type: String, enum: ['PENDING', 'SENT_TO_KITCHEN', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED'] },
      sentToKitchenAt: Date,
      kitchenAcceptedAt: Date,
      preparationStartedAt: Date,
      readyAt: Date,
      servedAt: Date,
      chefId: Types.ObjectId
    }],
    batchStatus: { type: String, enum: ['PENDING', 'SENT_TO_KITCHEN', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED'] },
    batchNote: String,
    sentToKitchenAt: Date,
    kitchenAcceptedAt: Date,
    allItemsReadyAt: Date,
    allItemsServedAt: Date,
    chefId: Types.ObjectId,
    preparationStartedAt: Date,
    readyAt: Date
  }]})
  batches?: OrderBatchMongo[];

  @Prop({ required: true, type: Number })
  totalAmount: number;

  // Legacy staff assignments (deprecated - use kitchenDetails, deliveryDetails, takeawayDetails instead)
  @Prop({ type: Types.ObjectId })
  chefId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  waiterId?: Types.ObjectId;

  // Kitchen information
  @Prop({ type: {
    chefId: { type: Types.ObjectId },
    assistantChefId: { type: Types.ObjectId },
    sentToKitchenAt: { type: Date },
    acceptedAt: { type: Date },
    preparationStartedAt: { type: Date },
    readyAt: { type: Date },
    notes: { type: String },
    estimatedPrepTime: { type: String }
  }})
  kitchenDetails?: {
    chefId?: Types.ObjectId;
    assistantChefId?: Types.ObjectId;
    sentToKitchenAt?: Date;
    acceptedAt?: Date;
    preparationStartedAt?: Date;
    readyAt?: Date;
    notes?: string;
    estimatedPrepTime?: string; // e.g., "25-30 mins", "45 mins"
  };

  // Delivery information
  @Prop({ type: {
    driverId: { type: Types.ObjectId },
    acceptedAt: { type: Date },
    readyAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedDeliveryTime: { type: Number },
    actualDeliveryTime: { type: Number },
    notes: { type: String }
  }})
  deliveryDetails?: {
    driverId?: Types.ObjectId;
    acceptedAt?: Date;
    readyAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    estimatedDeliveryTime?: number; // in minutes
    actualDeliveryTime?: number; // in minutes
    notes?: string;
  };

  // Takeaway information
  @Prop({ type: {
    waiterId: { type: Types.ObjectId },
    readyAt: { type: Date },
    pickedUpAt: { type: Date },
    customerName: { type: String },
    customerPhone: { type: String },
    notes: { type: String }
  }})
  takeawayDetails?: {
    waiterId?: Types.ObjectId;
    readyAt?: Date;
    pickedUpAt?: Date;
    customerName?: string;
    customerPhone?: string;
    notes?: string;
  };

  @Prop({ type: String })
  cancellationReason?: string;

  // Customer information for anonymous orders
  @Prop({ type: String })
  customerName?: string;

  @Prop({ type: String })
  customerPhone?: string;

  @Prop({ type: String })
  customerEmail?: string;

  // Order notes
  @Prop({ type: String })
  orderNotes?: string;

  @Prop({ type: String })
  waiterNotes?: string;

  // Takeaway specific fields
  @Prop({ type: String })
  takeawayPhone?: string;

  @Prop({ type: String })
  takeawayName?: string;

  // Dine-in specific fields
  @Prop({ type: String })
  paymentStatus?: 'PENDING' | 'REQUESTED' | 'COMPLETED';

  @Prop({ type: Date })
  updatedAt?: Date;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order); 