import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  tableId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  partySize: number;

  @Prop({ required: true })
  reservationTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'seated', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';

  @Prop()
  specialRequests?: string;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  customerEmail?: string;

  @Prop({ unique: true })
  confirmationCode: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Add indexes for efficient querying
ReservationSchema.index({ restaurantId: 1, reservationTime: 1 });
ReservationSchema.index({ tableId: 1, reservationTime: 1 });
ReservationSchema.index({ userId: 1 });
ReservationSchema.index({ status: 1 });
