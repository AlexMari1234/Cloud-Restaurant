import { Document, Types } from 'mongoose';
export type RoleBindingDocument = RoleBinding & Document;
export declare class RoleBinding {
    userId: Types.ObjectId;
    role: string;
    resourceType: string;
    resourceId: Types.ObjectId;
}
export declare const RoleBindingSchema: import("mongoose").Schema<RoleBinding, import("mongoose").Model<RoleBinding, any, any, any, Document<unknown, any, RoleBinding> & RoleBinding & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RoleBinding, Document<unknown, {}, import("mongoose").FlatRecord<RoleBinding>> & import("mongoose").FlatRecord<RoleBinding> & {
    _id: Types.ObjectId;
}>;
