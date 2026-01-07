import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsModule } from './reservations/reservations.module';

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
        const dbName = config.get<string>('DB_NAME');
        const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.trfxdgr.mongodb.net/${dbName}`;
        return { uri, ssl: true };
      },
      inject: [ConfigService],
    }),
    ReservationsModule,
  ],
})
export class AppModule {}
