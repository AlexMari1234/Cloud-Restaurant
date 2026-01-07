"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const menu_controller_1 = require("./controllers/menu.controller");
const menu_service_1 = require("./services/menu.service");
const menu_schema_1 = require("./schemas/menu.schema");
const category_schema_1 = require("./schemas/category.schema");
const categories_controller_1 = require("./controllers/categories.controller");
const categories_service_1 = require("./services/categories.service");
const products_controller_1 = require("./controllers/products.controller");
const products_service_1 = require("./services/products.service");
const product_schema_1 = require("./schemas/product.schema");
const axios_1 = require("@nestjs/axios");
let MenuModule = class MenuModule {
};
exports.MenuModule = MenuModule;
exports.MenuModule = MenuModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: menu_schema_1.Menu.name, schema: menu_schema_1.MenuSchema },
                { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema }
            ]),
            axios_1.HttpModule,
        ],
        controllers: [menu_controller_1.MenuController, categories_controller_1.CategoriesController, products_controller_1.ProductsController, products_controller_1.ProductsDirectController],
        providers: [menu_service_1.MenuService, categories_service_1.CategoriesService, products_service_1.ProductsService],
        exports: [menu_service_1.MenuService, categories_service_1.CategoriesService, products_service_1.ProductsService],
    })
], MenuModule);
//# sourceMappingURL=menu.module.js.map