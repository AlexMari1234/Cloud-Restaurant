import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuController } from './controllers/menu.controller';
import { MenuService } from './services/menu.service';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { ProductsController, ProductsDirectController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema }
    ]),
    HttpModule,
  ],
  controllers: [MenuController, CategoriesController, ProductsController, ProductsDirectController],
  providers: [MenuService, CategoriesService, ProductsService],
  exports: [MenuService, CategoriesService, ProductsService],
})
export class MenuModule {} 