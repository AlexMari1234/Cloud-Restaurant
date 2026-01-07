import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ✅ Exportat pentru a fi folosit în alte module (ex: Auth)
})
export class UsersModule {}
