import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PendingRoleRequestsModule } from './pending-role-requests/pending-role-requests.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbUser = configService.get<string>('DB_USER');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME');
        const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.trfxdgr.mongodb.net/${dbName}`;
        return { uri, ssl: true };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PendingRoleRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
