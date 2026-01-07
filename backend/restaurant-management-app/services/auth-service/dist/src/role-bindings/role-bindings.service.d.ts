import { Model } from 'mongoose';
import { RoleBinding, RoleBindingDocument } from './role-binding.schema';
export declare class RoleBindingsService {
    private readonly model;
    constructor(model: Model<RoleBindingDocument>);
    upsert(userId: string, role: RoleBinding['role'], resourceId: string, resourceType: string): Promise<import("mongoose").UpdateWriteOpResult>;
    revoke(userId: string, resourceId: string, resourceType: string): Promise<import("mongodb").DeleteResult>;
    listForResource(resourceId: string, resourceType?: string): Promise<(import("mongoose").Document<unknown, {}, RoleBindingDocument> & RoleBinding & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    listForUser(userId: string): Promise<(import("mongoose").Document<unknown, {}, RoleBindingDocument> & RoleBinding & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
}
