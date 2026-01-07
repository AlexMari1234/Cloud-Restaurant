import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class EmployeeProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: String, enum: ['chef', 'waiter', 'cashier', 'manager', 'assistant_chef', 'driver'], required: true })
  roleLabel: string;

  @Prop({ type: Number, required: true })
  hourlyRate: number;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: Date })
  hireDate: Date;
}

export type EmployeeProfileDocument = EmployeeProfile & Document;
export const EmployeeProfileSchema = SchemaFactory.createForClass(EmployeeProfile);
