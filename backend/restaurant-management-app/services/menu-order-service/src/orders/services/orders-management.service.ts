import { Injectable } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { 
  OrderStatus, 
  UpdateOrderStatusDto, 
  AddItemToOrderDto,
  CreateDineInOrderDto,
  SendBatchToKitchenDto,
  UpdateBatchStatusDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  AddBatchToOrderDto
} from '@rm/common';

@Injectable()
export class OrdersManagementService {
  constructor(private readonly ordersService: OrdersService) {}

  async getOrdersByStatus(
    restaurantId: string,
    filters: { 
      status?: OrderStatus; 
      orderType?: string; 
      page: number; 
      limit: number 
    }
  ) {
    return this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      filters,
    );
  }

  async getOrderById(restaurantId: string, orderId: string) {
    return this.ordersService.getOrderById(orderId, undefined, restaurantId);
  }

  async updateOrderStatus(
    restaurantId: string,
    orderId: string,
    updateData: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatusForManagement(
      orderId,
      restaurantId,
      updateData.status,
      updateData.note,
      updateData.metadata,
    );
  }

  // Legacy method removed - use addBatchToOrder for dine-in orders

  // ======================== NEW DINE-IN MANAGEMENT METHODS ========================

  async createEnhancedDineInOrder(
    restaurantId: string,
    waiterId: string,
    waiterEmail: string,
    createOrderDto: CreateDineInOrderDto,
  ) {
    return this.ordersService.createEnhancedDineInOrder(
      waiterId,
      waiterEmail,
      restaurantId,
      createOrderDto,
    );
  }

  async sendBatchToKitchen(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    batchDto: SendBatchToKitchenDto,
  ) {
    return this.ordersService.sendBatchToKitchen(
      orderId,
      restaurantId,
      waiterId,
      batchDto,
    );
  }

  async kitchenAcceptBatch(
    restaurantId: string,
    orderId: string,
    chefId: string,
    batchNumber: number,
  ) {
    return this.ordersService.kitchenAcceptBatch(
      orderId,
      restaurantId,
      chefId,
      batchNumber,
    );
  }

  async updateBatchStatus(
    restaurantId: string,
    orderId: string,
    chefId: string,
    updateDto: UpdateBatchStatusDto,
  ) {
    return this.ordersService.updateBatchStatus(
      orderId,
      restaurantId,
      chefId,
      updateDto,
    );
  }

  async serveBatch(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    serveDto: ServeBatchDto,
  ) {
    return this.ordersService.serveBatch(
      orderId,
      restaurantId,
      waiterId,
      serveDto,
    );
  }

  async requestPayment(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    requestDto: RequestPaymentDto,
  ) {
    return this.ordersService.requestPayment(
      orderId,
      restaurantId,
      waiterId,
      requestDto,
    );
  }

  async completePayment(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    paymentDto: CompletePaymentDto,
  ) {
    return this.ordersService.completePayment(
      orderId,
      restaurantId,
      waiterId,
      paymentDto,
    );
  }

  async addBatchToOrder(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    batchDto: AddBatchToOrderDto,
  ) {
    return this.ordersService.addBatchToOrder(
      orderId,
      restaurantId,
      waiterId,
      batchDto,
    );
  }

  // Get orders with specific dine-in statuses
  async getDineInOrdersByStatus(
    restaurantId: string,
    filters: { 
      status?: OrderStatus; 
      orderType?: string; 
      page: number; 
      limit: number;
      includeItemStatus?: boolean; // Option to include item-level details
    }
  ) {
    // Filter for dine-in specific statuses and orderType
    const dineInFilters = {
      ...filters,
      orderType: 'DINE_IN'
    };
    
    return this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      dineInFilters,
    );
  }

  // Get orders ready for waiter (all items ready)
  async getOrdersReadyForService(restaurantId: string) {
    return this.getDineInOrdersByStatus(restaurantId, {
      status: 'ALL_READY' as OrderStatus,
      page: 1,
      limit: 50,
      includeItemStatus: true,
    });
  }

  // Get active dine-in orders (not yet completed)
  async getActiveDineInOrders(restaurantId: string) {
    return this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      {
        orderType: 'DINE_IN',
        page: 1,
        limit: 100,
      }
    );
  }

  // Get orders with items sent to kitchen awaiting acceptance
  async getOrdersPendingKitchenAcceptance(restaurantId: string) {
    return this.getDineInOrdersByStatus(restaurantId, {
      status: 'PARTIAL_KITCHEN' as OrderStatus,
      page: 1,
      limit: 50,
      includeItemStatus: true
    });
  }

  // Get orders accepted by kitchen (for preparation tracking)
  async getKitchenAcceptedOrders(restaurantId: string) {
    return this.getDineInOrdersByStatus(restaurantId, {
      status: 'KITCHEN_ACCEPTED' as OrderStatus,
      page: 1,
      limit: 50,
      includeItemStatus: true
    });
  }

  async updateItemStatus(
    restaurantId: string,
    orderId: string,
    batchNumber: number,
    productId: string,
    chefId: string,
    status: string
  ) {
    return this.ordersService.updateItemStatus(
      orderId,
      restaurantId,
      batchNumber,
      productId,
      chefId,
      status
    );
  }

  async batchPreparing(
    restaurantId: string,
    orderId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ) {
    return this.ordersService.batchPreparing(
      orderId,
      restaurantId,
      batchNumber,
      chefId,
      note
    );
  }

  async batchReady(
    restaurantId: string,
    orderId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ) {
    return this.ordersService.batchReady(
      orderId,
      restaurantId,
      batchNumber,
      chefId,
      note
    );
  }

  // ======================== SPECIFIC KITCHEN/WAITER FILTERING METHODS ========================

  async getPendingDineInOrdersForKitchen(restaurantId: string) {
    // Get dine-in orders that have batches sent to kitchen but not yet accepted
    return this.ordersService.getPendingDineInOrdersForKitchen(restaurantId);
  }

  async getAcceptedDineInOrdersForKitchen(restaurantId: string) {
    // Get dine-in orders accepted by kitchen but not all batches ready
    return this.ordersService.getAcceptedDineInOrdersForKitchen(restaurantId);
  }

  async getReadyDineInOrdersForKitchen(restaurantId: string) {
    // Get dine-in orders with ready batches (ALL_READY status)
    return this.ordersService.getReadyDineInOrdersForKitchen(restaurantId);
  }

  async getCurrentOrdersForWaiter(restaurantId: string) {
    // Get all orders in progress (not completed/cancelled)
    return this.ordersService.getCurrentOrdersForWaiter(restaurantId);
  }

  async getCompletedOrdersForWaiter(restaurantId: string) {
    // Get recently completed orders
    return this.ordersService.getCompletedOrdersForWaiter(restaurantId);
  }

  async getReadyBatchesForWaiter(restaurantId: string) {
    // Get dine-in orders with ready batches to serve
    return this.ordersService.getReadyBatchesForWaiter(restaurantId);
  }

  async getReadyTakeawayOrders(restaurantId: string) {
    // Get takeaway orders ready for pickup
    return this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      {
        orderType: 'TAKEAWAY',
        status: 'READY_FOR_PICKUP' as OrderStatus,
        page: 1,
        limit: 50,
      }
    );
  }

  async getReadyDeliveryOrders(restaurantId: string) {
    // Get delivery orders ready for delivery
    return this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      {
        orderType: 'DELIVERY',
        status: 'READY_FOR_DELIVERY' as OrderStatus,
        page: 1,
        limit: 50,
      }
    );
  }

  async getPendingDeliveryOrders(restaurantId: string) {
    // Get delivery orders pending kitchen acceptance
    return this.ordersService.getPendingDeliveryOrders(restaurantId);
  }

  async getPendingTakeawayOrders(restaurantId: string) {
    // Get takeaway orders pending kitchen acceptance
    return this.ordersService.getPendingTakeawayOrders(restaurantId);
  }

  async getAssignedDeliveryOrders(restaurantId: string) {
    // Get delivery orders assigned to drivers (accepted but not delivered)
    // We need to query for multiple statuses, so we'll use a different approach
    const orders = await this.ordersService.getOrdersForRestaurantManagement(
      restaurantId,
      {
        orderType: 'DELIVERY',
        page: 1,
        limit: 100, // Get more to filter by status
      }
    );
    
    // Filter orders by status
    const assignedOrders = orders.orders.filter(order => 
      order.status === 'DRIVER_ACCEPTED' || order.status === 'IN_DELIVERY'
    );
    
    return {
      orders: assignedOrders,
      total: assignedOrders.length,
      page: 1,
      totalPages: 1,
    };
  }


} 