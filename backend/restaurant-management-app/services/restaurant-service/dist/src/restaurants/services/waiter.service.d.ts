import { HttpService } from '@nestjs/axios';
import { CreateDineInOrderDto, SendBatchToKitchenDto, AddBatchToOrderDto, ServeBatchDto, RequestPaymentDto, CompletePaymentDto } from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';
export declare class WaiterService {
    private readonly httpService;
    private readonly kafkaService;
    constructor(httpService: HttpService, kafkaService: KafkaService);
    getReadyBatches(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    createDineInOrder(restaurantId: string, waiterId: string, createDto: CreateDineInOrderDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    sendBatchToKitchen(restaurantId: string, orderId: string, waiterId: string, batchDto: SendBatchToKitchenDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addBatchToOrder(restaurantId: string, orderId: string, waiterId: string, batchDto: AddBatchToOrderDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    serveBatch(restaurantId: string, orderId: string, waiterId: string, serveDto: ServeBatchDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    requestPayment(restaurantId: string, orderId: string, waiterId: string, requestDto: RequestPaymentDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    completePayment(restaurantId: string, orderId: string, waiterId: string, paymentDto: CompletePaymentDto, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    getReadyTakeawayOrders(restaurantId: string, token: string): Promise<{
        orders: any;
    }>;
    pickupTakeawayOrder(restaurantId: string, orderId: string, waiterId: string, body: {
        customerName?: string;
        note?: string;
    }, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentOrders(restaurantId: string, waiterId?: string, token?: string): Promise<{
        orders: any;
    }>;
    getCompletedOrders(restaurantId: string, waiterId?: string, token?: string): Promise<{
        orders: any;
    }>;
}
