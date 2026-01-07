import { WaiterService } from '../services/waiter.service';
import { CreateDineInOrderDto, SendBatchToKitchenDto, ServeBatchDto, RequestPaymentDto, CompletePaymentDto, AddBatchToOrderDto } from '@rm/common';
export declare class WaiterController {
    private readonly waiterService;
    private readonly logger;
    constructor(waiterService: WaiterService);
    private extractToken;
    createDineInOrder(restaurantId: string, createOrderDto: CreateDineInOrderDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    sendBatchToKitchen(restaurantId: string, orderId: string, batchDto: SendBatchToKitchenDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    addBatchToOrder(restaurantId: string, orderId: string, batchDto: AddBatchToOrderDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    serveBatch(restaurantId: string, orderId: string, serveDto: ServeBatchDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    requestPayment(restaurantId: string, orderId: string, requestDto: RequestPaymentDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    completePayment(restaurantId: string, orderId: string, paymentDto: CompletePaymentDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllOrders(restaurantId: string, req: any): Promise<{
        orders: any;
    }>;
    getReadyBatches(restaurantId: string, req: any): Promise<{
        orders: any;
    }>;
    getCurrentOrders(restaurantId: string, req: any): Promise<{
        orders: any;
    }>;
    getCompletedOrders(restaurantId: string, req: any): Promise<{
        orders: any;
    }>;
    getReadyTakeawayOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    pickupTakeawayOrder(req: any, restaurantId: string, orderId: string, body: {
        customerName?: string;
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
