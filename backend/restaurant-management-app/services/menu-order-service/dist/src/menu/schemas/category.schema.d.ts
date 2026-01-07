import { Document, Types } from 'mongoose';
export interface CategoryDocument extends Category, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Category {
    restaurantId: Types.ObjectId;
    menuId: Types.ObjectId;
    name: string;
    parentId?: Types.ObjectId;
    sortOrder?: number;
    currency: string;
    isActive: boolean;
    type: 'products' | 'subcategories';
}
export declare const CategorySchema: import("mongoose").Schema<Category, import("mongoose").Model<Category, any, any, any, Document<unknown, any, Category> & Category & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Category, Document<unknown, {}, import("mongoose").FlatRecord<Category>> & import("mongoose").FlatRecord<Category> & {
    _id: Types.ObjectId;
}>;
