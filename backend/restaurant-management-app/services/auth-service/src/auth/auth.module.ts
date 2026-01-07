import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

import { UsersModule } from '../users/users.module'; // ✅ adăugat corect
import { PendingRoleRequestsModule } from '../pending-role-requests/pending-role-requests.module';
import { User, UserSchema } from '../users/schemas/user.schema'; // user din users

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '10d' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // doar dacă ai nevoie direct aici
    UsersModule,
    PendingRoleRequestsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
