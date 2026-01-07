import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })   // ➔ Adăugat name
  name: string;

  @Prop({
    type: [
      {
        provider: { type: String, enum: ['google', 'facebook'] },
        providerId: { type: String },
        linkedAt: { type: Date },
      }
    ],
    default: []
  })
  providers: { provider: string; providerId: string; linkedAt: Date }[];

  @Prop({ type: String, enum: ['client', 'manager', 'employee', 'owner', 'superadmin'], default: 'client' })
  role: 'client' | 'manager' | 'employee' | 'owner' | 'superadmin';

  @Prop({ type: String, enum: ['pending', 'active', 'disabled', 'deleted'], default: 'pending' })
  status: 'pending' | 'active' | 'disabled' | 'deleted';

  @Prop({ type: String, enum: ['manager', 'employee'], required: false })
  requestedRole?: 'manager' | 'employee';

  @Prop({ type: Date, required: false })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Metoda pentru compararea parolei la login
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};
