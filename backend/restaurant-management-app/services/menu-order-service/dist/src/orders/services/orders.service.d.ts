import { Model } from 'mongoose';
import { CreateOrderFromCartDto, OrderStatus, CreateDineInOrderDto, SendBatchToKitchenDto, UpdateBatchStatusDto, ServeBatchDto, RequestPaymentDto, CompletePaymentDto, AddBatchToOrderDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { KafkaService } from '../../kafka/kafka.service';
import { CartService } from './cart.service';
import { DineInOrdersService } from './dine-in-orders.service';
import { DeliveryTakeawayOrdersService } from './delivery-takeaway-orders.service';
import { OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
export declare class OrdersService {
    private orderModel;
    private readonly kafkaService;
    private readonly cartService;
    private readonly httpService;
    private readonly productsService;
    private readonly dineInOrdersService;
    private readonly deliveryTakeawayOrdersService;
    constructor(orderModel: Model<OrderDocument>, kafkaService: KafkaService, cartService: CartService, httpService: HttpService, productsService: ProductsService, dineInOrdersService: DineInOrdersService, deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService);
    private getUserIdFromEmail;
    createOrderFromCart(userId: string, userEmail: string, restaurantId: string, createOrderDto: CreateOrderFromCartDto): Promise<OrderDocument>;
    getUserOrders(userId: string, restaurantId: string, filters: {
        status?: OrderStatus;
        page: number;
        limit: number;
    }): Promise<{
        orders: OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(orderId: string, userId?: string, restaurantId?: string): Promise<OrderDocument>;
    cancelOrder(orderId: string, userId: string, restaurantId: string): Promise<OrderDocument>;
    getOrderTrackingInfo(orderId: string, restaurantId: string): Promise<any>;
    getOrdersForRestaurantManagement(restaurantId: string, filters: {
        status?: OrderStatus;
        orderType?: string;
        page: number;
        limit: number;
    }): Promise<{
        orders: OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateOrderStatusForManagement(orderId: string, restaurantId: string, status: OrderStatus, note?: string, metadata?: any): Promise<OrderDocument>;
    createEnhancedDineInOrder(waiterId: string, waiterEmail: string, restaurantId: string, createOrderDto: CreateDineInOrderDto): Promise<OrderDocument>;
    sendBatchToKitchen(orderId: string, restaurantId: string, waiterId: string, batchDto: SendBatchToKitchenDto): Promise<OrderDocument>;
    kitchenAcceptBatch(orderId: string, restaurantId: string, chefId: string, batchNumber: number): Promise<OrderDocument>;
    updateBatchStatus(orderId: string, restaurantId: string, chefId: string, updateDto: UpdateBatchStatusDto): Promise<OrderDocument>;
    serveBatch(orderId: string, restaurantId: string, waiterId: string, serveDto: ServeBatchDto): Promise<OrderDocument>;
    addBatchToOrder(orderId: string, restaurantId: string, waiterId: string, batchDto: AddBatchToOrderDto): Promise<OrderDocument>;
    requestPayment(orderId: string, restaurantId: string, waiterId: string, requestDto: RequestPaymentDto): Promise<OrderDocument>;
    completePayment(orderId: string, restaurantId: string, waiterId: string, paymentDto: CompletePaymentDto): Promise<OrderDocument>;
    getActiveDineInOrders(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForService(restaurantId: string): Promise<OrderDocument[]>;
    createDeliveryOrder(customerId: string, createOrderDto: any): Promise<OrderDocument>;
    createTakeawayOrder(customerId: string, createOrderDto: any): Promise<OrderDocument>;
    kitchenAcceptDeliveryOrder(orderId: string, restaurantId: string, chefId: string, body?: any): Promise<OrderDocument>;
    kitchenAcceptTakeawayOrder(orderId: string, restaurantId: string, chefId: string, body?: any): Promise<OrderDocument>;
    updateDeliveryStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument>;
    updateTakeawayStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument>;
    completeDeliveryOrder(orderId: string, restaurantId: string, driverId?: string): Promise<OrderDocument>;
    completeTakeawayOrder(orderId: string, restaurantId: string, waiterId?: string): Promise<OrderDocument>;
    getActiveDeliveryOrders(restaurantId: string): Promise<OrderDocument[]>;
    getActiveTakeawayOrders(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForDelivery(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForPickup(restaurantId: string): Promise<OrderDocument[]>;
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
    pickupTakeawayOrder(restaurantId: string, orderId: string, customerId: string, body: {
        customerName?: string;
    }): Promise<OrderDocument>;
}
