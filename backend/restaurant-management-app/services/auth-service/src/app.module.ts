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
        // Prioritize MONGODB_URI if provided (for local MongoDB)
        const mongodbUri = configService.get<string>('MONGODB_URI');
        if (mongodbUri) {
          return { uri: mongodbUri };
        }
        
        // Fallback to Atlas connection (for backward compatibility)
        const dbUser = configService.get<string>('DB_USER');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME');
        const dbHost = configService.get<string>('DB_HOST', 'cluster0.trfxdgr.mongodb.net');
        
        // Check if it's a local MongoDB connection
        if (dbHost && !dbHost.includes('mongodb.net')) {
          // Local MongoDB connection
          const dbPort = configService.get<string>('DB_PORT', '27017');
          const uri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
          return { uri };
        }
        
        // Atlas connection
        const uri = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}`;
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
