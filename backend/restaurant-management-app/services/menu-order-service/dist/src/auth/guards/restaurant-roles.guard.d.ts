import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpService } from '@nestjs/axios';
export declare class RestaurantRolesGuard implements CanActivate {
    private reflector;
    private httpService;
    constructor(reflector: Reflector, httpService: HttpService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
