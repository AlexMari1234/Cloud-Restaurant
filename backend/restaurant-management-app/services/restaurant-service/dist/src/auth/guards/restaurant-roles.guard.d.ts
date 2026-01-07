import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
import { RestaurantsService } from '../../restaurants/services/restaurants.service';
export declare class RestaurantRolesGuard implements CanActivate {
    private reflector;
    private httpService;
    private restaurantsService;
    constructor(reflector: Reflector, httpService: HttpService, restaurantsService: RestaurantsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
