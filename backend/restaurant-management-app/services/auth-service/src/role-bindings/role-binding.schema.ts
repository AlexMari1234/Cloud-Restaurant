import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleBindingDocument = RoleBinding & Document;

@Schema({ timestamps: true })
export class RoleBinding {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: string; // e.g., 'manager', 'employee'

  @Prop({ required: true })
  resourceType: string; // e.g., 'restaurant'

  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;
}

export const RoleBindingSchema = SchemaFactory.createForClass(RoleBinding);