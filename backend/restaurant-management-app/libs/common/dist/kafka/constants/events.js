"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNewOrderEvent = isNewOrderEvent;
exports.isKitchenAcceptedEvent = isKitchenAcceptedEvent;
function isNewOrderEvent(event) {
    return event.status === 'PENDING';
}
function isKitchenAcceptedEvent(event) {
    return event.status === 'KITCHEN_ACCEPTED';
}
//# sourceMappingURL=events.js.map