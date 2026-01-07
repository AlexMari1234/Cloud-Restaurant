"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const axios_1 = require("@nestjs/axios");
const restaurant_roles_decorator_1 = require("../decorators/restaurant-roles.decorator");
const restaurants_service_1 = require("../../restaurants/services/restaurants.service");
let RestaurantRolesGuard = class RestaurantRolesGuard {
    reflector;
    httpService;
    restaurantsService;
    constructor(reflector, httpService, restaurantsService) {
        this.reflector = reflector;
        this.httpService = httpService;
        this.restaurantsService = restaurantsService;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(restaurant_roles_decorator_1.RESTAURANT_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const restaurantId = request.params.restaurantId;
        const userId = request.user?._id;
        if (!restaurantId || !userId) {
            throw new common_1.ForbiddenException('Missing restaurantId or userId');
        }
        try {
            const userRoleData = await this.restaurantsService.checkUserRole(restaurantId, userId);
            const userRole = userRoleData?.role;
            if (!userRole) {
                throw new common_1.ForbiddenException('User has no role in this restaurant');
            }
            if (requiredRoles.includes(userRole)) {
                return true;
            }
            if (userRole === 'employee') {
                try {
                    const employees = await this.restaurantsService.findAllEmployees(restaurantId);
                    const employee = employees.find(emp => emp.userId.toString() === userId);
                    if (employee && requiredRoles.includes(employee.roleLabel)) {
                        return true;
                    }
                }
                catch (error) {
                    console.error('Error fetching employee role:', error);
                }
            }
            throw new common_1.ForbiddenException(`Required roles: ${requiredRoles.join(', ')}, user role: ${userRole}`);
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw error;
            }
            console.error('Error checking restaurant role:', error);
            throw new common_1.ForbiddenException('Could not verify restaurant role');
        }
    }
};
exports.RestaurantRolesGuard = RestaurantRolesGuard;
exports.RestaurantRolesGuard = RestaurantRolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        axios_1.HttpService,
        restaurants_service_1.RestaurantsService])
], RestaurantRolesGuard);
//# sourceMappingURL=restaurant-roles.guard.js.map