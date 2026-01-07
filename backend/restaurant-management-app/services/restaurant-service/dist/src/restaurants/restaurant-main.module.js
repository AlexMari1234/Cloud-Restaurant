"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantMainModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const restaurants_module_1 = require("./restaurants.module");
let RestaurantMainModule = class RestaurantMainModule {
};
exports.RestaurantMainModule = RestaurantMainModule;
exports.RestaurantMainModule = RestaurantMainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => {
                    const user = config.get('DB_USER');
                    const pass = config.get('DB_PASSWORD');
                    const uri = `mongodb+srv://${user}:${pass}@cluster0.7xpbzkc.mongodb.net/`;
                    return { uri, ssl: true };
                },
                inject: [config_1.ConfigService],
            }),
            restaurants_module_1.RestaurantsModule,
        ],
    })
], RestaurantMainModule);
//# sourceMappingURL=restaurant-main.module.js.map