import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';
import { DriverService } from '../services/driver.service';
import { DriverAcceptDto, DriverPickupDto } from '@rm/common';

@ApiTags('Driver Management')
@Controller('restaurants/:restaurantId/delivery')
@UseGuards(AuthGuard, RestaurantRolesGuard)
@RestaurantRoles('owner', 'manager', 'employee', 'driver')
@ApiBearerAuth()
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
  ) {}

  private extractToken(req: any): string {
    const authHeader = req.headers['authorization'];
    const jwtFromCookie = req.cookies?.jwt;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : jwtFromCookie;

    if (!token) {
      throw new Error('Missing or invalid token');
    }

    return token;
  }

  @Get('orders/ready')
  @ApiOperation({ summary: 'Get orders ready for delivery' })
  @ApiResponse({ status: 200, description: 'Returns orders ready for delivery' })
  async getReadyOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.driverService.getReadyOrders(restaurantId, token);
  }

  @Put('orders/:orderId/accept')
  @RestaurantRoles('owner', 'manager', 'driver')
  @ApiOperation({ summary: 'Driver accepts delivery order' })
  @ApiResponse({ status: 200, description: 'Order accepted by driver' })
  async acceptDelivery(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: DriverAcceptDto,
  ) {
    return this.driverService.acceptDelivery(restaurantId, orderId, req.user._id, body);
  }

  @Put('orders/:orderId/pickup')
  @RestaurantRoles('owner', 'manager', 'driver')
  @ApiOperation({ summary: 'Mark delivery order as picked up' })
  @ApiResponse({ status: 200, description: 'Delivery order marked as picked up' })
  async pickupDeliveryOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: DriverPickupDto,
  ) {
    return this.driverService.pickupDeliveryOrder(restaurantId, orderId, req.user._id, body);
  }

  @Put('orders/:orderId/deliver')
  @RestaurantRoles('owner', 'manager', 'driver')
  @ApiOperation({ summary: 'Driver delivers order to customer' })
  @ApiResponse({ status: 200, description: 'Order delivered successfully' })
  async deliverOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    const token = this.extractToken(req);
    return this.driverService.deliverOrder(restaurantId, orderId, req.user._id, token);
  }

  @Get('orders/assigned')
  @ApiOperation({ summary: 'Get orders assigned to current driver' })
  @ApiResponse({ status: 200, description: 'Returns assigned orders for driver' })
  async getAssignedOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.driverService.getAssignedOrders(restaurantId, token);
  }

  @Get('orders/completed')
  @RestaurantRoles('owner', 'manager', 'driver')
  @ApiOperation({ summary: 'Get orders completed by current driver' })
  @ApiResponse({ status: 200, description: 'Returns completed orders for driver' })
  async getCompletedOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.driverService.getCompletedOrders(restaurantId, req.user._id, token);
  }
} 