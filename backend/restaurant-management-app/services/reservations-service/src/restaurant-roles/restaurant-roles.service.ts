import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RestaurantRolesService {
  constructor(private readonly httpService: HttpService) {}

  async hasAccess(userId: string, restaurantId: string): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`,
        ),
      );
      return ['owner', 'manager', 'employee'].includes(data.role);
    } catch {
      throw new UnauthorizedException('Not authorized to access this restaurant');
    }
  }
}