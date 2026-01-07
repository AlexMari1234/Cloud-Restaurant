"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRoles = exports.RESTAURANT_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.RESTAURANT_ROLES_KEY = 'restaurantRoles';
const RestaurantRoles = (...roles) => (0, common_1.SetMetadata)(exports.RESTAURANT_ROLES_KEY, roles);
exports.RestaurantRoles = RestaurantRoles;
//# sourceMappingURL=restaurant-roles.decorator.js.map