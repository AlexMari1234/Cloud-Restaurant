import { TakeawayOrderCreatedEvent, KitchenAcceptTakeawayEvent, KitchenPreparingTakeawayEvent, KitchenReadyTakeawayEvent, CustomerPickupTakeawayEvent } from '@rm/common';
import { DeliveryTakeawayOrdersService } from '../../orders/services/delivery-takeaway-orders.service';
export declare class TakeawayEventsController {
    private readonly deliveryTakeawayOrdersService;
    private readonly logger;
    constructor(deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService);
    handleTakeawayOrderCreated(event: TakeawayOrderCreatedEvent): Promise<void>;
    handleKitchenAcceptTakeaway(event: KitchenAcceptTakeawayEvent): Promise<void>;
    handleKitchenPreparingTakeaway(event: KitchenPreparingTakeawayEvent): Promise<void>;
    handleKitchenReadyTakeaway(event: KitchenReadyTakeawayEvent): Promise<void>;
    handleCustomerPickupTakeaway(event: CustomerPickupTakeawayEvent): Promise<void>;
}
