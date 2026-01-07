import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ProductDocument extends Product, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: String, default: 'RON' })
  currency: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: String, enum: ['active', 'archived'], default: 'active' })
  status: 'active' | 'archived';

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: String })
  weight?: string;

  @Prop({ type: Object })
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export const ProductSchema = SchemaFactory.createForClass(Product); 