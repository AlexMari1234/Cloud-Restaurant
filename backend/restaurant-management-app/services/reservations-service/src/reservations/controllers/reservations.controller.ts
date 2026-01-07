import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { ReservationsService } from '../services/reservations.service';
import { ReservationsDto } from '@rm/common';
import { AuthGuard, RolesGuard } from '../../auth/guards';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(AuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Restaurant or table not found' })
  async createReservation(@Body() dto: ReservationsDto.CreateReservationDTO) {
    return this.reservationsService.createReservation(dto);
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available time slots for a table' })
  @ApiResponse({ status: 200, description: 'Returns list of available time slots' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Restaurant or table not found' })
  async getAvailableTimeSlots(@Query() dto: ReservationsDto.GetAvailableTimeSlotsDTO) {
    return this.reservationsService.getAvailableTimeSlots(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reservation by ID' })
  @ApiResponse({ status: 200, description: 'Returns the reservation' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async getReservation(@Param('id') id: string) {
    return this.reservationsService.getReservation(id);
  }

  @Put(':id/status')
  @Roles('owner', 'manager')
  @ApiOperation({ summary: 'Update reservation status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async updateReservationStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed',
  ) {
    return this.reservationsService.updateReservationStatus(id, status);
  }

  @Get('restaurant/:restaurantId')
  @Roles('owner', 'manager')
  @ApiOperation({ summary: 'Get all reservations for a restaurant on a specific date' })
  @ApiResponse({ status: 200, description: 'Returns list of reservations' })
  async getRestaurantReservations(
    @Param('restaurantId') restaurantId: string,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getRestaurantReservations(
      restaurantId,
      new Date(date),
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all reservations for a user' })
  @ApiResponse({ status: 200, description: 'Returns list of reservations' })
  async getUserReservations(@Param('userId') userId: string) {
    return this.reservationsService.getUserReservations(userId);
  }

  @Get('restaurant/:restaurantId/table/:tableNumber')
  @Roles('owner', 'manager')
  @ApiOperation({ summary: 'Get all reservations for a table in a restaurant on a specific day' })
  async getTableReservations(
    @Param('restaurantId') restaurantId: string,
    @Param('tableNumber') tableNumber: string,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getTableReservations(restaurantId, Number(tableNumber), new Date(date));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation (user only)' })
  async cancelReservation(@Param('id') id: string) {
    return this.reservationsService.cancelReservation(id);
  }

  @Patch(':id/complete')
  @Roles('owner', 'manager')
  @ApiOperation({ summary: 'Mark reservation as completed (owner/manager only)' })
  async completeReservation(@Param('id') id: string) {
    return this.reservationsService.completeReservation(id);
  }
}
