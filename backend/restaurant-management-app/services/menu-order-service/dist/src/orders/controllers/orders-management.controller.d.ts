import { OrdersManagementService } from '../services/orders-management.service';
import { OrderStatus, UpdateOrderStatusDto, AddItemToOrderDto } from '@rm/common';
export declare class OrdersManagementController {
    private readonly ordersManagementService;
    constructor(ordersManagementService: OrdersManagementService);
    getOrdersByStatus(restaurantId: string, status?: OrderStatus, orderType?: string, page?: number, limit?: number): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(restaurantId: string, orderId: string): Promise<import("../schemas/order.schema").OrderDocument>;
    updateOrderStatus(restaurantId: string, orderId: string, updateData: UpdateOrderStatusDto): Promise<import("../schemas/order.schema").OrderDocument>;
    addItemToOrder(restaurantId: string, orderId: string, addItemDto: AddItemToOrderDto, req: any): Promise<import("../schemas/order.schema").OrderDocument>;
    getActiveDineInOrders(restaurantId: string): Promise<{
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
    getPendingDineInOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPendingTakeawayOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPendingDeliveryOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getReadyDineInOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
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
    getPreparingOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getKitchenAcceptedAllOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getKitchenPendingDineInOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getKitchenAcceptedDineInOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getWaiterCurrentOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getWaiterCompletedOrders(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
    getWaiterReadyBatches(restaurantId: string): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
    }>;
}
