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
        const dbUser = config.get<string>('DB_USER');
        const dbPassword = config.get<string>('DB_PASSWORD');
        const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.7xpbzkc.mongodb.net/`;
        return { uri, ssl: true };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AuthAppModule {}