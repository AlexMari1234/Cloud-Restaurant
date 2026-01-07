export const OrderTypeEnum = {
  DINE_IN: 'DINE_IN',        // Servit la masă cu waiter
  DELIVERY: 'DELIVERY',      // Livrat acasă  
  TAKEAWAY: 'TAKEAWAY',      // La pachet - client vine să ia
} as const;

export const ItemStatusEnum = {
  PENDING: 'PENDING',                   // Item not yet sent to kitchen
  SENT_TO_KITCHEN: 'SENT_TO_KITCHEN',   // Item sent to kitchen, waiting for acceptance
  KITCHEN_ACCEPTED: 'KITCHEN_ACCEPTED', // Kitchen accepted this item
  PREPARING: 'PREPARING',               // Item being prepared
  READY: 'READY',                      // Item ready to be served
  SERVED: 'SERVED',                    // Item served to customer
} as const;

export const OrderStatusEnum = {
  PENDING: 'PENDING',                    // Comanda plasată, așteaptă confirmare
  RESTAURANT_CONFIRMED: 'RESTAURANT_CONFIRMED', // Restaurant a confirmat comanda
  KITCHEN_ACCEPTED: 'KITCHEN_ACCEPTED',  // Bucătăria a acceptat comanda
  PREPARING: 'PREPARING',                // În pregătire
  READY: 'READY',                       // Gata de servit/livrare/preluare
  
  // DINE_IN specific
  WAITER_ACCEPTED: 'WAITER_ACCEPTED',   // Waiter a preluat comanda
  SERVED: 'SERVED',                     // Servită la masă
  
  // DELIVERY specific  
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY', // Gata pentru livrare
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',   // Driver a preluat comanda
  IN_DELIVERY: 'IN_DELIVERY',           // În transport
  DELIVERED: 'DELIVERED',               // Livrată
  
  // TAKEAWAY specific
  READY_FOR_PICKUP: 'READY_FOR_PICKUP', // Gata pentru preluare
  PICKED_UP: 'PICKED_UP',               // Preluată de client
  
  // Final states
  COMPLETED: 'COMPLETED',               // Încheiată cu succes
  CANCELLED: 'CANCELLED',               // Anulată
  
  // New dine-in item-level statuses
  DRAFT: 'DRAFT',                       // Order created but not sent to kitchen
  PARTIAL_KITCHEN: 'PARTIAL_KITCHEN',   // Some items sent to kitchen  
  ALL_READY: 'ALL_READY',              // All items ready for service
  PARTIAL_SERVED: 'PARTIAL_SERVED',    // Some items served
  PAYMENT_REQUESTED: 'PAYMENT_REQUESTED', // Waiter requested payment
  DINE_IN_COMPLETED: 'DINE_IN_COMPLETED', // Customer paid and left
} as const; 