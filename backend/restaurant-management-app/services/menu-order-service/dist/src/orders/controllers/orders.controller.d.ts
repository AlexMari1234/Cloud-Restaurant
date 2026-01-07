import { OrdersService } from '../services/orders.service';
import { OrderStatus, CreateOrderFromCartDto, CreateDineInOrderDto } from '@rm/common';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrderFromCart(req: any, restaurantId: string, createOrderDto: CreateOrderFromCartDto): Promise<import("../schemas/order.schema").OrderDocument>;
    placeDirectOrder(req: any, restaurantId: string, createOrderDto: CreateOrderFromCartDto): Promise<import("../schemas/order.schema").OrderDocument>;
    createDirectDineInOrder(req: any, restaurantId: string, createOrderDto: CreateDineInOrderDto): Promise<import("../schemas/order.schema").OrderDocument>;
    getUserOrders(req: any, restaurantId: string, status?: OrderStatus, page?: number, limit?: number): Promise<{
        orders: import("../schemas/order.schema").OrderDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(req: any, restaurantId: string, orderId: string): Promise<import("../schemas/order.schema").OrderDocument>;
    cancelOrder(req: any, restaurantId: string, orderId: string): Promise<import("../schemas/order.schema").OrderDocument>;
    trackOrder(restaurantId: string, orderId: string): Promise<any>;
    pickupTakeawayOrder(req: any, restaurantId: string, orderId: string, body: {
        customerName?: string;
    }): Promise<import("../schemas/order.schema").OrderDocument>;
}
