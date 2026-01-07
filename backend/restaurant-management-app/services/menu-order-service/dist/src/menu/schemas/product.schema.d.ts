import { Document, Types } from 'mongoose';
export interface ProductDocument extends Product, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Product {
    restaurantId: Types.ObjectId;
    categoryId: Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    allergens: string[];
    status: 'active' | 'archived';
    ingredients: string[];
    weight?: string;
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, Document<unknown, any, Product> & Product & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, import("mongoose").FlatRecord<Product>> & import("mongoose").FlatRecord<Product> & {
    _id: Types.ObjectId;
}>;
