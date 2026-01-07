import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PendingRoleRequestDocument = HydratedDocument<PendingRoleRequest>;

@Schema({ timestamps: true })
export class PendingRoleRequest extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true, enum: ['manager', 'employee'] })
  requestedRole: 'manager' | 'employee';

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  processedAt?: Date;
}

export const PendingRoleRequestSchema = SchemaFactory.createForClass(PendingRoleRequest);
