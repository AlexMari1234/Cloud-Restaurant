import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RESTAURANT_ROLES_KEY } from '../decorators/restaurant-roles.decorator';

@Injectable()
export class RestaurantRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(RESTAURANT_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Dacă nu sunt specificate roluri, permitem accesul
    }

    const request = context.switchToHttp().getRequest();
    const restaurantId = request.params.restaurantId;
    const userId = request.user?._id;

    if (!restaurantId || !userId) {
      throw new ForbiddenException('Missing restaurantId or userId');
    }

    // Obținem token-ul din request
    let token = request.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = request.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }

    try {
      // Verificăm rolul userului pentru acest restaurant
      const response = await firstValueFrom(
        this.httpService.get(
          `http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`,
          { headers: { Authorization: token } }
        )
      );

      const userRole = response.data?.role;
      
      // Verificăm dacă rolul userului este în lista de roluri permise
      return requiredRoles.includes(userRole);
    } catch (error) {
      console.error('Error checking restaurant role:', error);
      throw new ForbiddenException('Could not verify restaurant role');
    }
  }
} 