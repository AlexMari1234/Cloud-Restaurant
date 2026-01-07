import { Document, HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type PendingRoleRequestDocument = HydratedDocument<PendingRoleRequest>;
export declare class PendingRoleRequest extends Document {
    userId: User;
    requestedRole: 'manager' | 'employee';
    status: 'pending' | 'approved' | 'rejected';
    processedAt?: Date;
}
export declare const PendingRoleRequestSchema: mongoose.Schema<PendingRoleRequest, mongoose.Model<PendingRoleRequest, any, any, any, Document<unknown, any, PendingRoleRequest> & PendingRoleRequest & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, PendingRoleRequest, Document<unknown, {}, mongoose.FlatRecord<PendingRoleRequest>> & mongoose.FlatRecord<PendingRoleRequest> & {
    _id: mongoose.Types.ObjectId;
}>;
