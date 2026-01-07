import { DriverGetReadyOrdersRequestEvent, DriverGetReadyOrdersResponseEvent, DriverGetAssignedOrdersRequestEvent, DriverGetAssignedOrdersResponseEvent } from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { KafkaService } from '../../kafka/kafka.service';
export declare class DriverRequestsController {
    private readonly ordersManagementService;
    private readonly kafkaService;
    private readonly logger;
    constructor(ordersManagementService: OrdersManagementService, kafkaService: KafkaService);
    handleGetReadyOrdersRequest(event: DriverGetReadyOrdersRequestEvent): Promise<DriverGetReadyOrdersResponseEvent>;
    handleGetAssignedOrdersRequest(event: DriverGetAssignedOrdersRequestEvent): Promise<DriverGetAssignedOrdersResponseEvent>;
}
