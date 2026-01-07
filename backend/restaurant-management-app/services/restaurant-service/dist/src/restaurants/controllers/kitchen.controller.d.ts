import { KitchenService } from '../services/kitchen.service';
import { KitchenAcceptOrderDto, KitchenStartPreparingDto, KitchenMarkReadyDto, KitchenAcceptDeliveryOrderDto, KitchenAcceptTakeawayOrderDto, KitchenStartPreparingDeliveryOrderDto, KitchenStartPreparingTakeawayOrderDto, KitchenMarkReadyDeliveryOrderDto, KitchenMarkReadyTakeawayOrderDto, KitchenAcceptBatchDto, UpdateBatchStatusDto } from '@rm/common';
export declare class KitchenController {
    private readonly kitchenService;
    constructor(kitchenService: KitchenService);
    private extractToken;
    getPendingOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    acceptOrder(req: any, restaurantId: string, orderId: string, body: KitchenAcceptOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    startPreparing(req: any, restaurantId: string, orderId: string, body: KitchenStartPreparingDto): Promise<{
        success: boolean;
        message: string;
    }>;
    markReady(req: any, restaurantId: string, orderId: string, body: KitchenMarkReadyDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    acceptTakeawayOrder(req: any, restaurantId: string, orderId: string, body: KitchenAcceptTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingTakeawayOrder(req: any, restaurantId: string, orderId: string, body: KitchenStartPreparingTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    readyTakeawayOrder(req: any, restaurantId: string, orderId: string, body: KitchenMarkReadyTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getReadyTakeawayOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    acceptDeliveryOrder(req: any, restaurantId: string, orderId: string, body: KitchenAcceptDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingDeliveryOrder(req: any, restaurantId: string, orderId: string, body: KitchenStartPreparingDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    readyDeliveryOrder(req: any, restaurantId: string, orderId: string, body: KitchenMarkReadyDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getReadyDeliveryOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    acceptDineInBatch(req: any, restaurantId: string, orderId: string, body: KitchenAcceptBatchDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateDineInBatchStatus(req: any, restaurantId: string, orderId: string, body: UpdateBatchStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingDineInBatch(req: any, restaurantId: string, orderId: string, batchNumber: number, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    readyDineInBatch(req: any, restaurantId: string, orderId: string, batchNumber: number, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateDineInItemStatus(req: any, restaurantId: string, orderId: string, batchNumber: number, productId: string, body: {
        status: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingDineInOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
    getAcceptedDineInOrders(req: any, restaurantId: string): Promise<{
        orders: any;
    }>;
}
