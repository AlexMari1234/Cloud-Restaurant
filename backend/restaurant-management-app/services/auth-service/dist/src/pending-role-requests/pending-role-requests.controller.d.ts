import { PendingRoleRequestsService } from './pending-role-requests.service';
import { UsersService } from '../users/users.service';
export declare class PendingRoleRequestsController {
    private readonly pendingRoleRequestsService;
    private readonly usersService;
    constructor(pendingRoleRequestsService: PendingRoleRequestsService, usersService: UsersService);
    getAllPending(): Promise<Omit<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/pending-role-request.schema").PendingRoleRequest> & import("./schemas/pending-role-request.schema").PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("./schemas/pending-role-request.schema").PendingRoleRequest> & import("./schemas/pending-role-request.schema").PendingRoleRequest & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    approve(id: string): Promise<{
        message: string;
    }>;
    reject(id: string): Promise<{
        message: string;
    }>;
}
