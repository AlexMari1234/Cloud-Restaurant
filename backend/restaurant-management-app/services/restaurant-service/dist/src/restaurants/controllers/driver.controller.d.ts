import { DriverService } from '../services/driver.service';
import { DriverAcceptDto, DriverPickupDto } from '@rm/common';
export declare class DriverController {
    private readonly driverService;
    constructor(driverService: DriverService);
    private extractToken;
    getReadyOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    acceptDelivery(req: any, restaurantId: string, orderId: string, body: DriverAcceptDto): Promise<{
        success: boolean;
        message: string;
    }>;
    pickupDeliveryOrder(req: any, restaurantId: string, orderId: string, body: DriverPickupDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deliverOrder(req: any, restaurantId: string, orderId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssignedOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
}
