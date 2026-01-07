import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PendingRoleRequest, PendingRoleRequestDocument } from '../pending-role-requests/schemas/pending-role-request.schema';
import { Model } from 'mongoose';

@Injectable()
export class PendingRoleRequestsService {
  constructor(
    @InjectModel(PendingRoleRequest.name)
    private readonly model: Model<PendingRoleRequestDocument>,
  ) {}

  async findAllPending() {
    return this.model
      .find({ status: 'pending' })
      .populate('userId', 'email username name role status')
      .exec();
  }

  async findById(id: string) {
    return this.model
      .findById(id)
      .populate('userId', 'email username name role status')
      .exec();
  }

  async approveRequest(id: string) {
    return this.model.findByIdAndUpdate(id, { status: 'approved', processedAt: new Date() }, { new: true });
  }

  async rejectRequest(id: string) {
    return this.model.findByIdAndUpdate(id, { status: 'rejected', processedAt: new Date() }, { new: true });
  }

  async deleteRequest(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  async createPendingRequest(userId: string, requestedRole: 'manager' | 'employee'): Promise<PendingRoleRequest> {
    return this.model.create({
      userId,
      requestedRole,
      status: 'pending',
      createdAt: new Date(),
    });
  }
}
