"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const axios_1 = require("@nestjs/axios");
const cart_controller_1 = require("./controllers/cart.controller");
const orders_controller_1 = require("./controllers/orders.controller");
const orders_management_controller_1 = require("./controllers/orders-management.controller");
const cart_service_1 = require("./services/cart.service");
const orders_service_1 = require("./services/orders.service");
const orders_management_service_1 = require("./services/orders-management.service");
const dine_in_orders_service_1 = require("./services/dine-in-orders.service");
const delivery_takeaway_orders_service_1 = require("./services/delivery-takeaway-orders.service");
const cart_schema_1 = require("./schemas/cart.schema");
const order_schema_1 = require("./schemas/order.schema");
const product_schema_1 = require("../menu/schemas/product.schema");
const category_schema_1 = require("../menu/schemas/category.schema");
const menu_schema_1 = require("../menu/schemas/menu.schema");
const kafka_module_1 = require("../kafka/kafka.module");
const products_service_1 = require("../menu/services/products.service");
const takeaway_events_controller_1 = require("../kafka/controllers/takeaway-events.controller");
const delivery_events_controller_1 = require("../kafka/controllers/delivery-events.controller");
const dine_in_events_controller_1 = require("../kafka/controllers/dine-in-events.controller");
const kitchen_requests_controller_1 = require("./controllers/kitchen-requests.controller");
const waiter_requests_controller_1 = require("./controllers/waiter-requests.controller");
const driver_requests_controller_1 = require("./controllers/driver-requests.controller");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: cart_schema_1.Cart.name, schema: cart_schema_1.CartSchema },
                { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: menu_schema_1.Menu.name, schema: menu_schema_1.MenuSchema },
            ]),
            axios_1.HttpModule,
            (0, common_1.forwardRef)(() => kafka_module_1.KafkaModule),
        ],
        controllers: [cart_controller_1.CartController, orders_controller_1.OrdersController, orders_management_controller_1.OrdersManagementController, takeaway_events_controller_1.TakeawayEventsController, delivery_events_controller_1.DeliveryEventsController, dine_in_events_controller_1.DineInEventsController, kitchen_requests_controller_1.KitchenRequestsController, waiter_requests_controller_1.WaiterRequestsController, driver_requests_controller_1.DriverRequestsController],
        providers: [cart_service_1.CartService, orders_service_1.OrdersService, orders_management_service_1.OrdersManagementService, dine_in_orders_service_1.DineInOrdersService, delivery_takeaway_orders_service_1.DeliveryTakeawayOrdersService, products_service_1.ProductsService],
        exports: [cart_service_1.CartService, orders_service_1.OrdersService, orders_management_service_1.OrdersManagementService, dine_in_orders_service_1.DineInOrdersService, delivery_takeaway_orders_service_1.DeliveryTakeawayOrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map