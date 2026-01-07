import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsController } from './controllers/restaurants.controller';
import { RestaurantsService } from './services/restaurants.service';
import { AuthModule } from '../auth/auth.module';
import { ShiftController } from './controllers/shift.controller';
import { ShiftService } from './services/shift.service';
import { RestaurantRolesGuard } from '../auth/guards/restaurant-roles.guard';
import { KitchenController } from './controllers/kitchen.controller';
import { DriverController } from './controllers/driver.controller';
import { DriverService } from './services/driver.service';
import { KitchenService } from './services/kitchen.service';
import { WaiterService } from './services/waiter.service';
import { WaiterController } from './controllers/waiter.controller';
import { KitchenResponsesController } from './kafka/kitchen-responses.controller';

import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { Table, TableSchema } from './schemas/table.schema';
import { EmployeeProfile, EmployeeProfileSchema } from './schemas/employee-profile.schema';
import { RoleBinding, RoleBindingSchema } from './schemas/role-binding.schema';
import { Shift, ShiftSchema } from './schemas/shift.schema';
import { HttpModule } from '@nestjs/axios';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Table.name, schema: TableSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: RoleBinding.name, schema: RoleBindingSchema },
      { name: Shift.name, schema: ShiftSchema },
    ]),
    AuthModule,
    HttpModule,
    KafkaModule,
  ],
  controllers: [RestaurantsController, ShiftController, KitchenController, DriverController, WaiterController],
  providers: [
    RestaurantsService, 
    ShiftService, 
    RestaurantRolesGuard, 
    DriverService, 
    KitchenService, 
    WaiterService,
    KitchenResponsesController,
  ],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
