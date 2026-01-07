import { HttpService } from '@nestjs/axios';
import { KitchenAcceptOrderDto, KitchenStartPreparingDto, KitchenMarkReadyDto } from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';
import { KitchenResponsesController } from '../kafka/kitchen-responses.controller';
import { KitchenAcceptDeliveryOrderDto, KitchenAcceptTakeawayOrderDto, KitchenStartPreparingDeliveryOrderDto, KitchenStartPreparingTakeawayOrderDto, KitchenMarkReadyDeliveryOrderDto, KitchenMarkReadyTakeawayOrderDto, KitchenAcceptBatchDto, UpdateBatchStatusDto } from '@rm/common';
export declare class KitchenService {
    private readonly httpService;
    private readonly kafkaService;
    private readonly kitchenResponsesController;
    constructor(httpService: HttpService, kafkaService: KafkaService, kitchenResponsesController: KitchenResponsesController);
    getPendingOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    acceptOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenAcceptOrderDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    startPreparing(restaurantId: string, orderId: string, chefId: string, body: KitchenStartPreparingDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markReady(restaurantId: string, orderId: string, chefId: string, body: KitchenMarkReadyDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getActiveOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    acceptTakeawayOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenAcceptTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingTakeawayOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenStartPreparingTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    readyTakeawayOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenMarkReadyTakeawayOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getReadyTakeawayOrders(restaurantId: string, token?: string): Promise<{
        orders: any;
    }>;
    acceptDeliveryOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenAcceptDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingDeliveryOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenStartPreparingDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    readyDeliveryOrder(restaurantId: string, orderId: string, chefId: string, body: KitchenMarkReadyDeliveryOrderDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getReadyDeliveryOrders(restaurantId: string, token?: string): Promise<{
        orders: any;
    }>;
    acceptDineInBatch(restaurantId: string, orderId: string, chefId: string, body: KitchenAcceptBatchDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateDineInBatchStatus(restaurantId: string, orderId: string, chefId: string, body: UpdateBatchStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    preparingDineInBatch(restaurantId: string, orderId: string, chefId: string, batchNumber: number, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    readyDineInBatch(restaurantId: string, orderId: string, chefId: string, batchNumber: number, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateDineInItemStatus(restaurantId: string, orderId: string, chefId: string, batchNumber: number, productId: string, body: {
        status: string;
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingDineInOrders(restaurantId: string, token?: string): Promise<{
        orders: any;
    }>;
    getAcceptedDineInOrders(restaurantId: string, token?: string): Promise<{
        orders: any;
    }>;
}
