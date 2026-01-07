import { HttpService } from '@nestjs/axios';
export declare class RestaurantRolesService {
    private readonly httpService;
    constructor(httpService: HttpService);
    hasAccess(userId: string, restaurantId: string): Promise<boolean>;
}
