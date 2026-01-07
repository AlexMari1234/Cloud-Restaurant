import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RESTAURANT_ROLES_KEY } from '../decorators/restaurant-roles.decorator';
import { RestaurantsService } from '../../restaurants/services/restaurants.service';

@Injectable()
export class RestaurantRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private httpService: HttpService,
    private restaurantsService: RestaurantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(RESTAURANT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // If no roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const restaurantId = request.params.restaurantId;
    const userId = request.user?._id;

    if (!restaurantId || !userId) {
      throw new ForbiddenException('Missing restaurantId or userId');
    }

    try {
      // Check user role for this restaurant
      const userRoleData = await this.restaurantsService.checkUserRole(restaurantId, userId);
      const userRole = userRoleData?.role;
      
      if (!userRole) {
        throw new ForbiddenException('User has no role in this restaurant');
      }

      // Check if user has one of the basic roles (owner, manager, employee)
      if (requiredRoles.includes(userRole)) {
        return true;
      }

      // If user is an employee, also check specific employee role labels
      if (userRole === 'employee') {
        try {
          const employees = await this.restaurantsService.findAllEmployees(restaurantId);
          const employee = employees.find(emp => emp.userId.toString() === userId);
          
          if (employee && requiredRoles.includes(employee.roleLabel)) {
            return true;
          }
        } catch (error) {
          console.error('Error fetching employee role:', error);
        }
      }

      throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}, user role: ${userRole}`);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error checking restaurant role:', error);
      throw new ForbiddenException('Could not verify restaurant role');
    }
  }
} 