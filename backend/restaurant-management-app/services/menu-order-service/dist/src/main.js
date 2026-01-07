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
        origin: ['http://localhost:3010'],
        credentials: true,
    });
    try {
        app.connectMicroservice({
            transport: microservices_1.Transport.KAFKA,
            options: {
                client: {
                    clientId: 'menu-order-service-client',
                    brokers: [process.env.KAFKA_BROKER || 'kafka:29092'],
                    connectionTimeout: 10000,
                    requestTimeout: 30000,
                    retry: {
                        initialRetryTime: 1000,
                        retries: 8,
                    },
                },
                consumer: {
                    groupId: 'menu-order-consumer-client',
                    retry: {
                        initialRetryTime: 1000,
                        retries: 8,
                    },
                },
            },
        });
        console.log('🔄 Attempting to connect to Kafka...');
        await app.startAllMicroservices();
        console.log('✅ Kafka microservice connected successfully');
    }
    catch (error) {
        console.warn('⚠️ Kafka microservice failed to start, but HTTP service will continue:', error.message);
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Menu Order Service API')
        .setDescription('API pentru gestionarea meniurilor și comenzilor')
        .setVersion('1.0')
        .addCookieAuth('jwt')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT || 3003);
    console.log(`✅ Menu Order service running at http://localhost:${process.env.PORT || 3003}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map