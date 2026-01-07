"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const restaurant_main_module_1 = require("./restaurant-main.module");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(restaurant_main_module_1.RestaurantMainModule);
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: ['http://localhost:3000'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Restaurant Service API')
        .setDescription('API pentru gestionarea restaurantelor')
        .setVersion('1.0')
        .addCookieAuth('jwt')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3000);
    console.log(`Restaurant service running at http://localhost:3002/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map