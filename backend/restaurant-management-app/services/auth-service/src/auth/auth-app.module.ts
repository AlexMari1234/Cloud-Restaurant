import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        // Prioritize MONGODB_URI if provided (for local MongoDB)
        const mongodbUri = config.get<string>('MONGODB_URI');
        if (mongodbUri) {
          return { uri: mongodbUri };
        }
        
        // Fallback to Atlas connection (for backward compatibility)
        const dbUser = config.get<string>('DB_USER');
        const dbPassword = config.get<string>('DB_PASSWORD');
        const dbName = config.get<string>('DB_NAME', '');
        const dbHost = config.get<string>('DB_HOST', 'cluster0.7xpbzkc.mongodb.net');
        
        // Check if it's a local MongoDB connection
        if (dbHost && !dbHost.includes('mongodb.net')) {
          // Local MongoDB connection
          const dbPort = config.get<string>('DB_PORT', '27017');
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
  ],
})
export class AuthAppModule {}