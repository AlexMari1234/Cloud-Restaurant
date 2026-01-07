import { PendingRoleRequest, PendingRoleRequestDocument } from '../pending-role-requests/schemas/pending-role-request.schema';
import { Model } from 'mongoose';
export declare class PendingRoleRequestsService {
    private readonly model;
    constructor(model: Model<PendingRoleRequestDocument>);
    findAllPending(): Promise<Omit<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }) | null>;
    approveRequest(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }) | null>;
    rejectRequest(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }) | null>;
    deleteRequest(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, PendingRoleRequest> & PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }) | null>;
    createPendingRequest(userId: string, requestedRole: 'manager' | 'employee'): Promise<PendingRoleRequest>;
}
