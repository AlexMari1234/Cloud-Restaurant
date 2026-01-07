import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface CategoryDocument extends Category, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, type: Types.ObjectId })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Menu' })
  menuId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  parentId?: Types.ObjectId;

  @Prop({ default: 0 })
  sortOrder?: number;

  @Prop({ type: String, default: 'RON' })
  currency: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, enum: ['products', 'subcategories'], required: true })
  type: 'products' | 'subcategories';
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Middleware pentru ștergerea în cascadă a subcategoriilor
CategorySchema.pre('findOneAndDelete', async function(next) {
  const category = await this.model.findOne(this.getQuery());
  if (category) {
    await this.model.deleteMany({ parentId: category._id });
  }
  next();
});

CategorySchema.pre('deleteOne', async function(next) {
  const category = await this.model.findOne(this.getQuery());
  if (category) {
    await this.model.deleteMany({ parentId: category._id });
  }
  next();
}); 