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
const rxjs_1 = require("rxjs");
const restaurant_roles_decorator_1 = require("../decorators/restaurant-roles.decorator");
let RestaurantRolesGuard = class RestaurantRolesGuard {
    reflector;
    httpService;
    constructor(reflector, httpService) {
        this.reflector = reflector;
        this.httpService = httpService;
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
        let token = request.headers['authorization'];
        if (!token) {
            token = request.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`, { headers: { Authorization: token } }));
            const userRole = response.data?.role;
            return requiredRoles.includes(userRole);
        }
        catch (error) {
            console.error('Error checking restaurant role:', error);
            throw new common_1.ForbiddenException('Could not verify restaurant role');
        }
    }
};
exports.RestaurantRolesGuard = RestaurantRolesGuard;
exports.RestaurantRolesGuard = RestaurantRolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        axios_1.HttpService])
], RestaurantRolesGuard);
//# sourceMappingURL=restaurant-roles.guard.js.map