import { WaiterCreateDineInEvent, WaiterSendBatchEvent, WaiterAddBatchEvent, WaiterServeBatchEvent, WaiterRequestPaymentEvent, WaiterCompletePaymentEvent, KitchenAcceptBatchEvent, KitchenBatchPreparingEvent, KitchenBatchReadyEvent, KitchenItemPreparingEvent, KitchenItemReadyEvent } from '@rm/common';
import { DineInOrdersService } from '../../orders/services/dine-in-orders.service';
export declare class DineInEventsController {
    private readonly dineInOrdersService;
    private readonly logger;
    constructor(dineInOrdersService: DineInOrdersService);
    handleWaiterCreateDineIn(event: WaiterCreateDineInEvent): Promise<void>;
    handleWaiterSendBatch(event: WaiterSendBatchEvent): Promise<void>;
    handleWaiterAddBatch(event: WaiterAddBatchEvent): Promise<void>;
    handleWaiterServeBatch(event: WaiterServeBatchEvent): Promise<void>;
    handleWaiterRequestPayment(event: WaiterRequestPaymentEvent): Promise<void>;
    handleWaiterCompletePayment(event: WaiterCompletePaymentEvent): Promise<void>;
    handleKitchenAcceptBatch(event: KitchenAcceptBatchEvent): Promise<void>;
    handleKitchenBatchPreparing(event: KitchenBatchPreparingEvent): Promise<void>;
    handleKitchenBatchReady(event: KitchenBatchReadyEvent): Promise<void>;
    handleKitchenItemPreparing(event: KitchenItemPreparingEvent): Promise<void>;
    handleKitchenItemReady(event: KitchenItemReadyEvent): Promise<void>;
}
