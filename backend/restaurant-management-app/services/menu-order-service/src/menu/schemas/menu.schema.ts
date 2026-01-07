import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface MenuDocument extends Menu, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Menu {
  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'RON' })
  currency: string;

  @Prop({ default: 'ro' })
  language: string;

  @Prop({ type: Types.ObjectId })
  lastUpdatedBy?: Types.ObjectId;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);

// Middleware pentru ștergerea în cascadă a categoriilor
MenuSchema.pre('findOneAndDelete', async function(next) {
  const menu = await this.model.findOne(this.getQuery());
  if (menu) {
    const Category = this.model.db.model('Category');
    await Category.deleteMany({ menuId: menu._id });
  }
  next();
}); 