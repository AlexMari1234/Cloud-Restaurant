import { OrdersService } from './orders.service';
import { OrderStatus, UpdateOrderStatusDto, CreateDineInOrderDto, SendBatchToKitchenDto, UpdateBatchStatusDto, ServeBatchDto, RequestPaymentDto, CompletePaymentDto, AddBatchToOrderDto } from '@rm/common';
export declare class OrdersManagementService {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getOrdersByStatus(restaurantId: string, filters: {
        status?: OrderStatus;
        orderType?: string;
        page: number;
        limit: number;
    }): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(restaurantId: string, orderId: string): Promise<import("../schemas/order.schema").OrderDocument>;
    updateOrderStatus(restaurantId: string, orderId: string, updateData: UpdateOrderStatusDto): Promise<import("../schemas/order.schema").OrderDocument>;
    createEnhancedDineInOrder(restaurantId: string, waiterId: string, waiterEmail: string, createOrderDto: CreateDineInOrderDto): Promise<import("../schemas/order.schema").OrderDocument>;
    sendBatchToKitchen(restaurantId: string, orderId: string, waiterId: string, batchDto: SendBatchToKitchenDto): Promise<import("../schemas/order.schema").OrderDocument>;
    kitchenAcceptBatch(restaurantId: string, orderId: string, chefId: string, batchNumber: number): Promise<import("../schemas/order.schema").OrderDocument>;
    updateBatchStatus(restaurantId: string, orderId: string, chefId: string, updateDto: UpdateBatchStatusDto): Promise<import("../schemas/order.schema").OrderDocument>;
    serveBatch(restaurantId: string, orderId: string, waiterId: string, serveDto: ServeBatchDto): Promise<import("../schemas/order.schema").OrderDocument>;
    requestPayment(restaurantId: string, orderId: string, waiterId: string, requestDto: RequestPaymentDto): Promise<import("../schemas/order.schema").OrderDocument>;
    completePayment(restaurantId: string, orderId: string, waiterId: string, paymentDto: CompletePaymentDto): Promise<import("../schemas/order.schema").OrderDocument>;
    addBatchToOrder(restaurantId: string, orderId: string, waiterId: string, batchDto: AddBatchToOrderDto): Promise<import("../schemas/order.schema").OrderDocument>;
    getDineInOrdersByStatus(restaurantId: string, filters: {
        status?: OrderStatus;
        orderType?: string;
        page: number;
        limit: number;
        includeItemStatus?: boolean;
    }): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrdersReadyForService(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getActiveDineInOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrdersPendingKitchenAcceptance(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getKitchenAcceptedOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateItemStatus(restaurantId: string, orderId: string, batchNumber: number, productId: string, chefId: string, status: string): Promise<import("../schemas/order.schema").OrderDocument>;
    batchPreparing(restaurantId: string, orderId: string, batchNumber: number, chefId: string, note?: string): Promise<import("../schemas/order.schema").OrderDocument>;
    batchReady(restaurantId: string, orderId: string, batchNumber: number, chefId: string, note?: string): Promise<import("../schemas/order.schema").OrderDocument>;
    getPendingDineInOrdersForKitchen(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getAcceptedDineInOrdersForKitchen(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getCurrentOrdersForWaiter(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getCompletedOrdersForWaiter(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getReadyBatchesForWaiter(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getReadyTakeawayOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getReadyDeliveryOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getAssignedDeliveryOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
