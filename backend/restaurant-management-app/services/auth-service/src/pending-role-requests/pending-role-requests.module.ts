import { Module } from '@nestjs/common';
import { PendingRoleRequestsService } from './pending-role-requests.service';
import { PendingRoleRequestsController } from './pending-role-requests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PendingRoleRequest, PendingRoleRequestSchema } from '../pending-role-requests/schemas/pending-role-request.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PendingRoleRequest.name, schema: PendingRoleRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [PendingRoleRequestsController],
  providers: [PendingRoleRequestsService],
  exports: [PendingRoleRequestsService],
})
export class PendingRoleRequestsModule {}
