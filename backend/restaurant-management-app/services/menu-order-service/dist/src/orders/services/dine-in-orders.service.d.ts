import { Model } from 'mongoose';
import { CreateDineInOrderDto, SendBatchToKitchenDto, UpdateBatchStatusDto, ServeBatchDto, RequestPaymentDto, CompletePaymentDto, AddBatchToOrderDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { KafkaService } from '../../kafka/kafka.service';
import { OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
export declare class DineInOrdersService {
    private orderModel;
    private readonly kafkaService;
    private readonly httpService;
    private readonly productsService;
    private readonly logger;
    constructor(orderModel: Model<OrderDocument>, kafkaService: KafkaService, httpService: HttpService, productsService: ProductsService);
    private getUserIdFromEmail;
    createDineInOrder(waiterId: string, waiterEmail: string, restaurantId: string, createOrderDto: CreateDineInOrderDto): Promise<OrderDocument>;
    sendBatchToKitchen(orderId: string, restaurantId: string, waiterId: string, batchDto: SendBatchToKitchenDto): Promise<OrderDocument>;
    kitchenAcceptBatch(orderId: string, restaurantId: string, chefId: string, batchNumber: number): Promise<OrderDocument>;
    updateBatchStatus(orderId: string, restaurantId: string, chefId: string, updateDto: UpdateBatchStatusDto): Promise<OrderDocument>;
    serveBatch(orderId: string, restaurantId: string, waiterId: string, serveDto: ServeBatchDto): Promise<OrderDocument>;
    addBatchToOrder(orderId: string, restaurantId: string, waiterId: string, batchDto: AddBatchToOrderDto): Promise<OrderDocument>;
    requestPayment(orderId: string, restaurantId: string, waiterId: string, requestDto: RequestPaymentDto): Promise<OrderDocument>;
    completePayment(orderId: string, restaurantId: string, waiterId: string, paymentDto: CompletePaymentDto): Promise<OrderDocument>;
    getDineInOrderById(orderId: string, restaurantId: string): Promise<OrderDocument>;
    getActiveDineInOrders(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForService(restaurantId: string): Promise<OrderDocument[]>;
    updateItemStatus(orderId: string, restaurantId: string, batchNumber: number, productId: string, chefId: string, status: string): Promise<OrderDocument>;
    batchPreparing(orderId: string, restaurantId: string, batchNumber: number, chefId: string, note?: string): Promise<OrderDocument>;
    batchReady(orderId: string, restaurantId: string, batchNumber: number, chefId: string, note?: string): Promise<OrderDocument>;
    getPendingDineInOrdersForKitchen(restaurantId: string): Promise<{
        orders: OrderDocument[];
    }>;
    getAcceptedDineInOrdersForKitchen(restaurantId: string): Promise<{
        orders: OrderDocument[];
    }>;
    getCurrentOrdersForWaiter(restaurantId: string): Promise<{
        orders: OrderDocument[];
    }>;
    getCompletedOrdersForWaiter(restaurantId: string): Promise<{
        orders: OrderDocument[];
    }>;
    getReadyBatchesForWaiter(restaurantId: string): Promise<{
        orders: OrderDocument[];
    }>;
}
