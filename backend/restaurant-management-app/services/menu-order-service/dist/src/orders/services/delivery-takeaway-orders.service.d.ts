import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { KafkaService } from '../../kafka/kafka.service';
import { OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
export declare class DeliveryTakeawayOrdersService {
    private orderModel;
    private readonly kafkaService;
    private readonly httpService;
    private readonly productsService;
    constructor(orderModel: Model<OrderDocument>, kafkaService: KafkaService, httpService: HttpService, productsService: ProductsService);
    private getUserIdFromEmail;
    createDeliveryOrder(customerId: string, createOrderDto: any): Promise<OrderDocument>;
    createTakeawayOrder(customerId: string, createOrderDto: any): Promise<OrderDocument>;
    kitchenAcceptDeliveryOrder(orderId: string, restaurantId: string, chefId: string, body?: {
        note?: string;
        estimatedPrepTime?: string;
    }): Promise<OrderDocument>;
    kitchenAcceptTakeawayOrder(orderId: string, restaurantId: string, chefId: string, body?: {
        note?: string;
        estimatedPrepTime?: string;
    }): Promise<OrderDocument>;
    updateDeliveryStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument>;
    updateTakeawayStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument>;
    completeDeliveryOrder(orderId: string, restaurantId: string, driverId?: string): Promise<OrderDocument>;
    completeTakeawayOrder(orderId: string, restaurantId: string, waiterId?: string): Promise<OrderDocument>;
    private mapOrderStatusToItemStatus;
    getDeliveryOrderById(orderId: string, restaurantId: string): Promise<OrderDocument>;
    getTakeawayOrderById(orderId: string, restaurantId: string): Promise<OrderDocument>;
    getActiveDeliveryOrders(restaurantId: string): Promise<OrderDocument[]>;
    getActiveTakeawayOrders(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForDelivery(restaurantId: string): Promise<OrderDocument[]>;
    getOrdersReadyForPickup(restaurantId: string): Promise<OrderDocument[]>;
}
