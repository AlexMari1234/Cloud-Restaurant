import { Document, HydratedDocument, Types } from 'mongoose';
export type TableDocument = HydratedDocument<Table>;
export declare class Table extends Document {
    restaurantId: Types.ObjectId;
    number: number;
    capacity: number;
    type: 'indoor' | 'outdoor' | 'bar';
    isActive: boolean;
    unavailableDays: string[];
    minReservationTime?: number;
    maxReservationTime?: number;
}
export declare const TableSchema: import("mongoose").Schema<Table, import("mongoose").Model<Table, any, any, any, Document<unknown, any, Table> & Table & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Table, Document<unknown, {}, import("mongoose").FlatRecord<Table>> & import("mongoose").FlatRecord<Table> & {
    _id: Types.ObjectId;
}>;
