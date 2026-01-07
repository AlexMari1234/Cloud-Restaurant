import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { OrdersManagementController } from './controllers/orders-management.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { CartService } from './services/cart.service';
import { OrdersService } from './services/orders.service';
import { OrdersManagementService } from './services/orders-management.service';
import { DineInOrdersService } from './services/dine-in-orders.service';
import { DeliveryTakeawayOrdersService } from './services/delivery-takeaway-orders.service';

import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../menu/schemas/product.schema';
import { Category, CategorySchema } from '../menu/schemas/category.schema';
import { Menu, MenuSchema } from '../menu/schemas/menu.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { ProductsService } from '../menu/services/products.service';
import { TakeawayEventsController } from '../kafka/controllers/takeaway-events.controller';
import { DeliveryEventsController } from '../kafka/controllers/delivery-events.controller';
import { DineInEventsController } from '../kafka/controllers/dine-in-events.controller';
import { KitchenRequestsController } from './controllers/kitchen-requests.controller';
import { WaiterRequestsController } from './controllers/waiter-requests.controller';
import { DriverRequestsController } from './controllers/driver-requests.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Menu.name, schema: MenuSchema },
    ]),
    HttpModule,
    forwardRef(() => KafkaModule),
  ],
  controllers: [CartController, OrdersController, OrdersManagementController, UserProfileController, TakeawayEventsController, DeliveryEventsController, DineInEventsController, KitchenRequestsController, WaiterRequestsController, DriverRequestsController],
  providers: [CartService, OrdersService, OrdersManagementService, DineInOrdersService, DeliveryTakeawayOrdersService, ProductsService],
  exports: [CartService, OrdersService, OrdersManagementService, DineInOrdersService, DeliveryTakeawayOrdersService],
})
export class OrdersModule {} 