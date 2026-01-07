import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantsModule } from './restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const user = config.get<string>('DB_USER');
        const pass = config.get<string>('DB_PASSWORD');
        const uri  = `mongodb+srv://${user}:${pass}@cluster0.7xpbzkc.mongodb.net/`;
        return { uri, ssl: true };
      },
      inject: [ConfigService],
    }),
    RestaurantsModule,              // modulul cu controller & service
  ],
})
export class RestaurantMainModule {}  // <-- trebuie să se numească EXACT aşa
