import { KitchenGetPendingOrdersResponseEvent, KitchenGetDineInPendingResponseEvent } from '@rm/common';
export declare class KitchenResponsesController {
    private readonly logger;
    private pendingResponses;
    handleGetPendingOrdersResponse(event: KitchenGetPendingOrdersResponseEvent): Promise<void>;
    handleGetDineInPendingResponse(event: KitchenGetDineInPendingResponseEvent): Promise<void>;
    getResponse(requestId: string): any | null;
    waitForResponse(requestId: string, timeoutMs?: number): Promise<any>;
}
