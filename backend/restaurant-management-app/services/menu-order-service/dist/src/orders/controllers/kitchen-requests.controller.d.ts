import { KitchenGetPendingOrdersRequestEvent, KitchenGetPendingOrdersResponseEvent, KitchenGetDineInPendingRequestEvent, KitchenGetDineInPendingResponseEvent, KitchenGetActiveOrdersRequestEvent, KitchenGetActiveOrdersResponseEvent, KitchenGetAcceptedOrdersRequestEvent, KitchenGetAcceptedOrdersResponseEvent, KitchenGetDineInAcceptedRequestEvent, KitchenGetDineInAcceptedResponseEvent, KitchenGetReadyTakeawayRequestEvent, KitchenGetReadyTakeawayResponseEvent, KitchenGetReadyDeliveryRequestEvent, KitchenGetReadyDeliveryResponseEvent } from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { KafkaService } from '../../kafka/kafka.service';
export declare class KitchenRequestsController {
    private readonly ordersManagementService;
    private readonly kafkaService;
    private readonly logger;
    constructor(ordersManagementService: OrdersManagementService, kafkaService: KafkaService);
    handleGetPendingOrdersRequest(event: KitchenGetPendingOrdersRequestEvent): Promise<KitchenGetPendingOrdersResponseEvent>;
    handleGetDineInPendingRequest(event: KitchenGetDineInPendingRequestEvent): Promise<KitchenGetDineInPendingResponseEvent>;
    handleGetActiveOrdersRequest(event: KitchenGetActiveOrdersRequestEvent): Promise<KitchenGetActiveOrdersResponseEvent>;
    handleGetAcceptedOrdersRequest(event: KitchenGetAcceptedOrdersRequestEvent): Promise<KitchenGetAcceptedOrdersResponseEvent>;
    handleGetDineInAcceptedRequest(event: KitchenGetDineInAcceptedRequestEvent): Promise<KitchenGetDineInAcceptedResponseEvent>;
    handleGetReadyTakeawayRequest(event: KitchenGetReadyTakeawayRequestEvent): Promise<KitchenGetReadyTakeawayResponseEvent>;
    handleGetReadyDeliveryRequest(event: KitchenGetReadyDeliveryRequestEvent): Promise<KitchenGetReadyDeliveryResponseEvent>;
}
