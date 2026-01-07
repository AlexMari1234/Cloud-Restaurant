import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: {
        _id: string;
        email: string;
        username: string;
        role: string;
    };
}
