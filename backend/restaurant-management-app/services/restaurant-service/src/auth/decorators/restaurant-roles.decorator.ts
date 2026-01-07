import { SetMetadata } from '@nestjs/common';

export const RESTAURANT_ROLES_KEY = 'restaurantRoles';
export const RestaurantRoles = (...roles: string[]) => SetMetadata(RESTAURANT_ROLES_KEY, roles); 