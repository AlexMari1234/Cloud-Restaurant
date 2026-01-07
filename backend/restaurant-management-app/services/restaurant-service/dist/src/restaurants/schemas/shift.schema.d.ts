import { Document, Types } from 'mongoose';
export declare class Shift {
    employeeId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: 'scheduled' | 'completed' | 'missed' | 'canceled' | 'accepted' | 'declined' | 'swap_requested';
    checkInTime?: Date;
    checkOutTime?: Date;
    swapTarget?: Types.ObjectId;
}
export type ShiftDocument = Shift & Document;
export declare const ShiftSchema: import("mongoose").Schema<Shift, import("mongoose").Model<Shift, any, any, any, Document<unknown, any, Shift> & Shift & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Shift, Document<unknown, {}, import("mongoose").FlatRecord<Shift>> & import("mongoose").FlatRecord<Shift> & {
    _id: Types.ObjectId;
}>;
