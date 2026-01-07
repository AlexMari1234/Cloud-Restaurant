"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const restaurants_controller_1 = require("./controllers/restaurants.controller");
const restaurants_service_1 = require("./services/restaurants.service");
const auth_module_1 = require("../auth/auth.module");
const shift_controller_1 = require("./controllers/shift.controller");
const shift_service_1 = require("./services/shift.service");
const restaurant_roles_guard_1 = require("../auth/guards/restaurant-roles.guard");
const kitchen_controller_1 = require("./controllers/kitchen.controller");
const driver_controller_1 = require("./controllers/driver.controller");
const driver_service_1 = require("./services/driver.service");
const kitchen_service_1 = require("./services/kitchen.service");
const waiter_service_1 = require("./services/waiter.service");
const waiter_controller_1 = require("./controllers/waiter.controller");
const kitchen_responses_controller_1 = require("./kafka/kitchen-responses.controller");
const restaurant_schema_1 = require("./schemas/restaurant.schema");
const table_schema_1 = require("./schemas/table.schema");
const employee_profile_schema_1 = require("./schemas/employee-profile.schema");
const role_binding_schema_1 = require("./schemas/role-binding.schema");
const shift_schema_1 = require("./schemas/shift.schema");
const axios_1 = require("@nestjs/axios");
const kafka_module_1 = require("../kafka/kafka.module");
let RestaurantsModule = class RestaurantsModule {
};
exports.RestaurantsModule = RestaurantsModule;
exports.RestaurantsModule = RestaurantsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: restaurant_schema_1.Restaurant.name, schema: restaurant_schema_1.RestaurantSchema },
                { name: table_schema_1.Table.name, schema: table_schema_1.TableSchema },
                { name: employee_profile_schema_1.EmployeeProfile.name, schema: employee_profile_schema_1.EmployeeProfileSchema },
                { name: role_binding_schema_1.RoleBinding.name, schema: role_binding_schema_1.RoleBindingSchema },
                { name: shift_schema_1.Shift.name, schema: shift_schema_1.ShiftSchema },
            ]),
            auth_module_1.AuthModule,
            axios_1.HttpModule,
            kafka_module_1.KafkaModule,
        ],
        controllers: [restaurants_controller_1.RestaurantsController, shift_controller_1.ShiftController, kitchen_controller_1.KitchenController, driver_controller_1.DriverController, waiter_controller_1.WaiterController],
        providers: [
            restaurants_service_1.RestaurantsService,
            shift_service_1.ShiftService,
            restaurant_roles_guard_1.RestaurantRolesGuard,
            driver_service_1.DriverService,
            kitchen_service_1.KitchenService,
            waiter_service_1.WaiterService,
            kitchen_responses_controller_1.KitchenResponsesController,
        ],
        exports: [restaurants_service_1.RestaurantsService],
    })
], RestaurantsModule);
//# sourceMappingURL=restaurants.module.js.map