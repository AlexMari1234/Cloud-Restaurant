"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let AuthGuard = class AuthGuard {
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];
        const jwtFromCookie = req.cookies?.jwt;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : jwtFromCookie;
        if (!token) {
            throw new common_1.UnauthorizedException('Missing or invalid token');
        }
        try {
            const authResponse = await axios_1.default.get('http://auth-service:3000/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const restaurantResponse = await axios_1.default.get('http://restaurant-service:3001/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            req.user = {
                ...authResponse.data,
                _id: authResponse.data.id,
            };
            return true;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)()
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map