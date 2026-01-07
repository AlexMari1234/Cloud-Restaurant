import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type TableDocument = HydratedDocument<Table>;

@Schema({ timestamps: true })
export class Table extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: Types.ObjectId;

  @Prop({ required: true })
  number!: number;

  @Prop({ required: true })
  capacity!: number;

  @Prop({ type: String, enum: ['indoor', 'outdoor', 'bar'], required: true })
  type!: 'indoor' | 'outdoor' | 'bar';

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: [String], default: [] })
  unavailableDays!: string[]; // ['MONDAY', 'TUESDAY', etc.]

  @Prop({ type: Number })
  minReservationTime?: number; // in minutes from opening hour

  @Prop({ type: Number })
  maxReservationTime?: number; // in minutes from opening hour
}

export const TableSchema = SchemaFactory.createForClass(Table);

// Indexes for efficient querying
TableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
TableSchema.index({ restaurantId: 1, type: 1 });
TableSchema.index({ restaurantId: 1, capacity: 1 });
