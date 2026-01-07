import { Controller, Get, Param, Post, HttpCode, UseGuards } from '@nestjs/common';
import { PendingRoleRequestsService } from './pending-role-requests.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pending-role-requests')
@UseGuards(AuthGuard, RolesGuard)
export class PendingRoleRequestsController {
  constructor(
    private readonly pendingRoleRequestsService: PendingRoleRequestsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles('owner')
  async getAllPending() {
    return this.pendingRoleRequestsService.findAllPending();
  }

  @Post(':id/approve')
  @Roles('owner')
  @HttpCode(200)
  async approve(@Param('id') id: string) {
    const request = await this.pendingRoleRequestsService.findById(id);
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid request');
    }

    await this.usersService.promoteUserRole(request.userId._id.toString(), request.requestedRole);
    await this.pendingRoleRequestsService.approveRequest(id);
    await this.pendingRoleRequestsService.deleteRequest(id);
    return { message: 'User promoted successfully' };
  }

  @Post(':id/reject')
  @Roles('owner')
  @HttpCode(200)
  async reject(@Param('id') id: string) {
    const request = await this.pendingRoleRequestsService.findById(id);
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid request');
    }

    await this.usersService.disableUser(request.userId._id.toString());
    await this.pendingRoleRequestsService.rejectRequest(id);
    await this.pendingRoleRequestsService.deleteRequest(id);
    return { message: 'User rejected and disabled' };
  }
}
