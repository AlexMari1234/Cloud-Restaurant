import { OrderStatus } from './order.dto';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    note?: string;
    metadata?: {
        chefId?: string;
        waiterId?: string;
        driverId?: string;
        estimatedPrepTime?: string;
        preparationStartedAt?: Date;
        readyAt?: Date;
        [key: string]: any;
    };
}
//# sourceMappingURL=orders-management.dto.d.ts.map