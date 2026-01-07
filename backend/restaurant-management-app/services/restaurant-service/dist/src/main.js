"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const microservices_1 = require("@nestjs/microservices");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: ['http://localhost:3000'],
        credentials: true,
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: {
                clientId: 'restaurant-service-client',
                brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
            },
            consumer: {
                groupId: 'restaurant-consumer-client',
            },
        },
    });
    await app.startAllMicroservices();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Restaurant Service API')
        .setDescription('API pentru gestionarea restaurantelor')
        .setVersion('1.0')
        .addCookieAuth('jwt')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT || 3001);
    console.log(`✅ Restaurant service running at http://localhost:${process.env.PORT || 3001}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map