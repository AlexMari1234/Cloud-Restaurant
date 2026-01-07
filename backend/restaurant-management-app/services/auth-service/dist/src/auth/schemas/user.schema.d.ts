import { Document, HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
export declare class User extends Document {
    email: string;
    passwordHash: string;
    username: string;
    name: string;
    providers: {
        provider: string;
        providerId: string;
        linkedAt: Date;
    }[];
    role: 'client' | 'manager' | 'employee' | 'owner' | 'superadmin';
    status: 'pending' | 'active' | 'disabled' | 'deleted';
    requestedRole?: 'manager' | 'employee';
    lastLoginAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
