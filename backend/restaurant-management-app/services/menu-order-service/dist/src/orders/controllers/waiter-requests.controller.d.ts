import { WaiterGetAllOrdersRequestEvent, WaiterGetAllOrdersResponseEvent, WaiterGetReadyBatchesRequestEvent, WaiterGetReadyBatchesResponseEvent, WaiterGetCurrentOrdersRequestEvent, WaiterGetCurrentOrdersResponseEvent, WaiterGetCompletedOrdersRequestEvent, WaiterGetCompletedOrdersResponseEvent, WaiterGetReadyTakeawayRequestEvent, WaiterGetReadyTakeawayResponseEvent } from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { KafkaService } from '../../kafka/kafka.service';
export declare class WaiterRequestsController {
    private readonly ordersManagementService;
    private readonly kafkaService;
    private readonly logger;
    constructor(ordersManagementService: OrdersManagementService, kafkaService: KafkaService);
    handleGetAllOrdersRequest(event: WaiterGetAllOrdersRequestEvent): Promise<WaiterGetAllOrdersResponseEvent>;
    handleGetReadyBatchesRequest(event: WaiterGetReadyBatchesRequestEvent): Promise<WaiterGetReadyBatchesResponseEvent>;
    handleGetCurrentOrdersRequest(event: WaiterGetCurrentOrdersRequestEvent): Promise<WaiterGetCurrentOrdersResponseEvent>;
    handleGetCompletedOrdersRequest(event: WaiterGetCompletedOrdersRequestEvent): Promise<WaiterGetCompletedOrdersResponseEvent>;
    handleGetReadyTakeawayRequest(event: WaiterGetReadyTakeawayRequestEvent): Promise<WaiterGetReadyTakeawayResponseEvent>;
}
