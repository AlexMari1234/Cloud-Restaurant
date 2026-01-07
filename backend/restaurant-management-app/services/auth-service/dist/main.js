"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const auth_app_module_1 = require("./src/auth/auth-app.module");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(auth_app_module_1.AuthAppModule);
    app.use(cookieParser());
    app.enableCors({
        credentials: true,
        origin: ['http://localhost:3010'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Auth Service API')
        .setDescription('API pentru autentificare')
        .setVersion('1.0')
        .addCookieAuth('jwt')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(3000);
    console.log(`Auth service running at http://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map