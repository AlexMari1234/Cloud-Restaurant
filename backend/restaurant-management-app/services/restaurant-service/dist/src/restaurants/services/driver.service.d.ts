import { OrderEvent } from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';
import { HttpService } from '@nestjs/axios';
export declare class DriverService {
    private readonly kafkaService;
    private readonly httpService;
    private readonly logger;
    constructor(kafkaService: KafkaService, httpService: HttpService);
    handleOrderReadyForDelivery(event: OrderEvent): Promise<void>;
    handleDriverAccepted(event: OrderEvent): Promise<void>;
    handleOrderPickedUp(event: OrderEvent): Promise<void>;
    handleOrderDelivered(event: OrderEvent): Promise<void>;
    handleKitchenReady(event: OrderEvent): Promise<void>;
    private notifyAvailableDrivers;
    private calculateEstimatedDeliveryTime;
    getReadyOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    acceptDelivery(restaurantId: string, orderId: string, driverId: string, body: {
        estimatedDeliveryTime: string;
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    pickupDeliveryOrder(restaurantId: string, orderId: string, driverId: string, body: {
        note?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    deliverOrder(restaurantId: string, orderId: string, driverId: string, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssignedOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
}
