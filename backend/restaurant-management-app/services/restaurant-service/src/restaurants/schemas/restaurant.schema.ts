import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type RestaurantDocument = HydratedDocument<Restaurant>;

@Schema({ timestamps: true })
export class Restaurant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  managerId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  logoUrl: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  })
  geo: { type: 'Point'; coordinates: [number, number] };

  @Prop({ required: true })
  timezone: string;

  @Prop({ required: true })
  capacity: number; // number of seats

  @Prop({ required: true })
  openingHour: number; // 0-23

  @Prop({ required: true })
  closingHour: number; // 0-23

  @Prop({ required: true, default: 90 }) // in minutes
  reservationDuration: number;

  @Prop({ required: true, default: 30 }) // in minutes
  timeSlotInterval: number;

  @Prop({ type: [String], default: [] })
  closedDays: string[]; // ['MONDAY', 'TUESDAY', etc.]

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
