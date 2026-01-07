import { Document, Types } from 'mongoose';
export declare class EmployeeProfile {
    userId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    roleLabel: string;
    hourlyRate: number;
    status: string;
    hireDate: Date;
}
export type EmployeeProfileDocument = EmployeeProfile & Document;
export declare const EmployeeProfileSchema: import("mongoose").Schema<EmployeeProfile, import("mongoose").Model<EmployeeProfile, any, any, any, Document<unknown, any, EmployeeProfile> & EmployeeProfile & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EmployeeProfile, Document<unknown, {}, import("mongoose").FlatRecord<EmployeeProfile>> & import("mongoose").FlatRecord<EmployeeProfile> & {
    _id: Types.ObjectId;
}>;
