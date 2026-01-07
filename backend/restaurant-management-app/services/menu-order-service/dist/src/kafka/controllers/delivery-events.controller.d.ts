import { DriverAcceptDeliveryEvent, DriverPickupDeliveryEvent, DriverDeliverOrderEvent, KitchenAcceptDeliveryEvent, KitchenPreparingDeliveryEvent, KitchenReadyDeliveryEvent } from '@rm/common';
import { DeliveryTakeawayOrdersService } from '../../orders/services/delivery-takeaway-orders.service';
export declare class DeliveryEventsController {
    private readonly deliveryTakeawayOrdersService;
    private readonly logger;
    constructor(deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService);
    handleDriverAcceptDelivery(event: DriverAcceptDeliveryEvent): Promise<void>;
    handleDriverPickupDelivery(event: DriverPickupDeliveryEvent): Promise<void>;
    handleDriverDeliverOrder(event: DriverDeliverOrderEvent): Promise<void>;
    handleKitchenAcceptDelivery(event: KitchenAcceptDeliveryEvent): Promise<void>;
    handleKitchenPreparingDelivery(event: KitchenPreparingDeliveryEvent): Promise<void>;
    handleKitchenReadyDelivery(event: KitchenReadyDeliveryEvent): Promise<void>;
}
