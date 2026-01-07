import { Document, HydratedDocument, Types } from 'mongoose';
export type RestaurantDocument = HydratedDocument<Restaurant>;
export declare class Restaurant extends Document {
    ownerId: Types.ObjectId;
    managerId?: Types.ObjectId;
    name: string;
    slug: string;
    logoUrl: string;
    address: string;
    geo: {
        type: 'Point';
        coordinates: [number, number];
    };
    timezone: string;
    openingHour: number;
    closingHour: number;
    reservationDuration: number;
    timeSlotInterval: number;
    closedDays: string[];
    isActive: boolean;
}
export declare const RestaurantSchema: import("mongoose").Schema<Restaurant, import("mongoose").Model<Restaurant, any, any, any, Document<unknown, any, Restaurant> & Restaurant & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Restaurant, Document<unknown, {}, import("mongoose").FlatRecord<Restaurant>> & import("mongoose").FlatRecord<Restaurant> & {
    _id: Types.ObjectId;
}>;
