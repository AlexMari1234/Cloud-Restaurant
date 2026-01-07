import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Shift {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, required: true })
  endTime: Date;

  @Prop({
    type: String,
    enum: ['scheduled', 'completed', 'missed', 'canceled', 'accepted', 'declined', 'swap_requested'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'completed' | 'missed' | 'canceled' | 'accepted' | 'declined' | 'swap_requested';

  @Prop({ type: Date })
  checkInTime?: Date;

  @Prop({ type: Date })
  checkOutTime?: Date;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: false })
  swapTarget?: Types.ObjectId;
}

export type ShiftDocument = Shift & Document;
export const ShiftSchema = SchemaFactory.createForClass(Shift); 