import { Document, Types } from 'mongoose';
export interface MenuDocument extends Menu, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Menu {
    restaurantId: Types.ObjectId;
    name: string;
    description?: string;
    isActive: boolean;
    currency: string;
    language: string;
    lastUpdatedBy?: Types.ObjectId;
}
export declare const MenuSchema: import("mongoose").Schema<Menu, import("mongoose").Model<Menu, any, any, any, Document<unknown, any, Menu> & Menu & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Menu, Document<unknown, {}, import("mongoose").FlatRecord<Menu>> & import("mongoose").FlatRecord<Menu> & {
    _id: Types.ObjectId;
}>;
