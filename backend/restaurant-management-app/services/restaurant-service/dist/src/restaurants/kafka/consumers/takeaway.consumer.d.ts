import { TakeawayOrderCreatedEvent, KitchenAcceptTakeawayEvent, KitchenPreparingTakeawayEvent, KitchenReadyTakeawayEvent, CustomerPickupTakeawayEvent } from '@rm/common';
export declare class TakeawayConsumer {
    private readonly logger;
    handleTakeawayOrderCreated(event: TakeawayOrderCreatedEvent): Promise<void>;
    handleKitchenAcceptTakeaway(event: KitchenAcceptTakeawayEvent): Promise<void>;
    handleKitchenPreparingTakeaway(event: KitchenPreparingTakeawayEvent): Promise<void>;
    handleKitchenReadyTakeaway(event: KitchenReadyTakeawayEvent): Promise<void>;
    handleCustomerPickupTakeaway(event: CustomerPickupTakeawayEvent): Promise<void>;
    private notifyKitchenAboutNewTakeaway;
    private notifyCustomerOrderAccepted;
    private notifyCustomerPreparationStarted;
    private notifyCustomerOrderReady;
    private notifyWaiterAboutReadyTakeaway;
    private notifyKitchenOrderPickedUp;
}
