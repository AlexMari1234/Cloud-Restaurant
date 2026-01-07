import { Document, HydratedDocument, Types } from 'mongoose';
export type ReservationDocument = HydratedDocument<Reservation>;
export declare class Reservation {
    restaurantId: Types.ObjectId;
    tableId: Types.ObjectId;
    userId?: Types.ObjectId;
    partySize: number;
    reservationTime: Date;
    endTime: Date;
    status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
    specialRequests?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    confirmationCode: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ReservationSchema: import("mongoose").Schema<Reservation, import("mongoose").Model<Reservation, any, any, any, Document<unknown, any, Reservation> & Reservation & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reservation, Document<unknown, {}, import("mongoose").FlatRecord<Reservation>> & import("mongoose").FlatRecord<Reservation> & {
    _id: Types.ObjectId;
}>;
