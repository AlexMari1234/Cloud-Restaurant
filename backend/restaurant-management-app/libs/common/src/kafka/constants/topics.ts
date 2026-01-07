export const ORDER_TOPICS = {
  // General Order Events
  PENDING: 'orders.new', // Map PENDING status to 'orders.new' topic
  NEW: 'orders.new',
  RESTAURANT_CONFIRMED: 'orders.confirmed',
  CONFIRMED: 'orders.confirmed',
  CANCELLED: 'orders.cancelled',

  // Kitchen Events
  KITCHEN_ACCEPTED: 'orders.kitchen-accepted',
  PREPARING: 'orders.preparing',
  READY: 'orders.ready',

  // Waiter Events (Dine-in)
  WAITER_ACCEPTED: 'orders.waiter-accepted',
  SERVED: 'orders.served',
  COMPLETED: 'orders.completed',

  // Driver Events (Delivery)
  READY_FOR_DELIVERY: 'orders.ready-for-delivery',
  DRIVER_ACCEPTED: 'orders.driver-accepted',
  IN_DELIVERY: 'orders.picked-up', // Map IN_DELIVERY to picked-up topic
  PICKED_UP: 'orders.picked-up',
  DELIVERED: 'orders.delivered',

  // Takeaway Events
  READY_FOR_PICKUP: 'orders.ready-for-pickup',

  // Dine-in Order Events
  DRAFT: 'orders.dine-in.created',
  DINE_IN_CREATED: 'orders.dine-in.created',
  PARTIAL_KITCHEN: 'orders.dine-in.batch-sent',
  BATCH_SENT_TO_KITCHEN: 'orders.dine-in.batch-sent-to-kitchen',
  ITEM_STATUS_CHANGED: 'orders.dine-in.item-status-changed',
  ALL_READY: 'orders.dine-in.all-ready',
  PARTIAL_SERVED: 'orders.dine-in.partial-served',
  PAYMENT_REQUESTED: 'orders.dine-in.payment-requested',
  DINE_IN_COMPLETED: 'orders.dine-in.completed',

  // Dine-in Batch Status Mappings (following delivery pattern)
  BATCH_ACCEPTED: 'orders.dine-in.batch-accepted',
  BATCH_PREPARING: 'orders.dine-in.batch-preparing',
  BATCH_READY: 'orders.dine-in.batch-ready',
  BATCH_SERVED: 'orders.dine-in.batch-served',

  // Takeaway Event Topics
  TAKEAWAY_ORDER_CREATED: 'takeaway.order.created',
  TAKEAWAY_KITCHEN_ACCEPT: 'takeaway.kitchen.accept',
  TAKEAWAY_KITCHEN_PREPARING: 'takeaway.kitchen.preparing',
  TAKEAWAY_KITCHEN_READY: 'takeaway.kitchen.ready',
  TAKEAWAY_CUSTOMER_PICKUP: 'takeaway.customer.pickup',

  // Delivery Event Topics
  DELIVERY_ORDER_CREATED: 'delivery.order.created',
  DELIVERY_KITCHEN_ACCEPT: 'delivery.kitchen.accept',
  DELIVERY_KITCHEN_PREPARING: 'delivery.kitchen.preparing',
  DELIVERY_KITCHEN_READY: 'delivery.kitchen.ready',
  DELIVERY_DRIVER_ACCEPT: 'delivery.driver.accept',
  DELIVERY_DRIVER_PICKUP: 'delivery.driver.pickup',
  DELIVERY_DRIVER_DELIVER: 'delivery.driver.deliver',

  // Dine-in Event Topics (restaurant-service to menu-order-service)
  DINE_IN_WAITER_CREATE: 'dine-in.waiter.create',
  DINE_IN_WAITER_SEND_BATCH: 'dine-in.waiter.send-batch',
  DINE_IN_WAITER_ADD_BATCH: 'dine-in.waiter.add-batch',
  DINE_IN_WAITER_SERVE_BATCH: 'dine-in.waiter.serve-batch',
  DINE_IN_WAITER_REQUEST_PAYMENT: 'dine-in.waiter.request-payment',
  DINE_IN_WAITER_COMPLETE_PAYMENT: 'dine-in.waiter.complete-payment',
  DINE_IN_KITCHEN_ACCEPT_BATCH: 'dine-in.kitchen.accept-batch',
  DINE_IN_KITCHEN_BATCH_PREPARING: 'dine-in.kitchen.batch-preparing',
  DINE_IN_KITCHEN_BATCH_READY: 'dine-in.kitchen.batch-ready',
  DINE_IN_KITCHEN_ITEM_PREPARING: 'dine-in.kitchen.item-preparing',
  DINE_IN_KITCHEN_ITEM_READY: 'dine-in.kitchen.item-ready',

  // Request/Response Topics for Kitchen Orders
  KITCHEN_GET_PENDING_ORDERS_REQUEST: 'kitchen.get-pending-orders.request',
  KITCHEN_GET_PENDING_ORDERS_RESPONSE: 'kitchen.get-pending-orders.response',
  KITCHEN_GET_DINE_IN_PENDING_REQUEST: 'kitchen.get-dine-in-pending.request',
  KITCHEN_GET_DINE_IN_PENDING_RESPONSE: 'kitchen.get-dine-in-pending.response',
  KITCHEN_GET_ACTIVE_ORDERS_REQUEST: 'kitchen.get-active-orders.request',
  KITCHEN_GET_ACTIVE_ORDERS_RESPONSE: 'kitchen.get-active-orders.response',
  KITCHEN_GET_ACCEPTED_ORDERS_REQUEST: 'kitchen.get-accepted-orders.request',
  KITCHEN_GET_ACCEPTED_ORDERS_RESPONSE: 'kitchen.get-accepted-orders.response',
  KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST: 'kitchen.get-dine-in-accepted.request',
  KITCHEN_GET_DINE_IN_ACCEPTED_RESPONSE: 'kitchen.get-dine-in-accepted.response',
  KITCHEN_GET_READY_TAKEAWAY_REQUEST: 'kitchen.get-ready-takeaway.request',
  KITCHEN_GET_READY_TAKEAWAY_RESPONSE: 'kitchen.get-ready-takeaway.response',
  KITCHEN_GET_READY_DELIVERY_REQUEST: 'kitchen.get-ready-delivery.request',
  KITCHEN_GET_READY_DELIVERY_RESPONSE: 'kitchen.get-ready-delivery.response',
  KITCHEN_GET_PENDING_DELIVERY_REQUEST: 'kitchen.get-pending-delivery.request',
  KITCHEN_GET_PENDING_DELIVERY_RESPONSE: 'kitchen.get-pending-delivery.response',
  KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST: 'kitchen.get-in-progress-delivery.request',
  KITCHEN_GET_IN_PROGRESS_DELIVERY_RESPONSE: 'kitchen.get-in-progress-delivery.response',
  KITCHEN_GET_PENDING_TAKEAWAY_REQUEST: 'kitchen.get-pending-takeaway.request',
  KITCHEN_GET_PENDING_TAKEAWAY_RESPONSE: 'kitchen.get-pending-takeaway.response',
  KITCHEN_GET_DINE_IN_READY_REQUEST: 'kitchen.get-dine-in-ready.request',
  KITCHEN_GET_DINE_IN_READY_RESPONSE: 'kitchen.get-dine-in-ready.response',

  // Request/Response Topics for Waiter Orders
  WAITER_GET_ALL_ORDERS_REQUEST: 'waiter.get-all-orders.request',
  WAITER_GET_ALL_ORDERS_RESPONSE: 'waiter.get-all-orders.response',
  WAITER_GET_READY_BATCHES_REQUEST: 'waiter.get-ready-batches.request',
  WAITER_GET_READY_BATCHES_RESPONSE: 'waiter.get-ready-batches.response',
  WAITER_GET_CURRENT_ORDERS_REQUEST: 'waiter.get-current-orders.request',
  WAITER_GET_CURRENT_ORDERS_RESPONSE: 'waiter.get-current-orders.response',
  WAITER_GET_COMPLETED_ORDERS_REQUEST: 'waiter.get-completed-orders.request',
  WAITER_GET_COMPLETED_ORDERS_RESPONSE: 'waiter.get-completed-orders.response',
  WAITER_GET_READY_TAKEAWAY_REQUEST: 'waiter.get-ready-takeaway.request',
  WAITER_GET_READY_TAKEAWAY_RESPONSE: 'waiter.get-ready-takeaway.response',

  // Request/Response Topics for Driver Orders
  DRIVER_GET_READY_ORDERS_REQUEST: 'driver.get-ready-orders.request',
  DRIVER_GET_READY_ORDERS_RESPONSE: 'driver.get-ready-orders.response',
  DRIVER_GET_ASSIGNED_ORDERS_REQUEST: 'driver.get-assigned-orders.request',
  DRIVER_GET_ASSIGNED_ORDERS_RESPONSE: 'driver.get-assigned-orders.response',
  DRIVER_GET_COMPLETED_ORDERS_REQUEST: 'driver.get-completed-orders.request',
  DRIVER_GET_COMPLETED_ORDERS_RESPONSE: 'driver.get-completed-orders.response'
} as const;

export type OrderTopic = typeof ORDER_TOPICS[keyof typeof ORDER_TOPICS]; 