import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleBinding, RoleBindingDocument } from './role-binding.schema';

@Injectable()
export class RoleBindingsService {
  constructor(
    @InjectModel(RoleBinding.name)
    private readonly model: Model<RoleBindingDocument>,
  ) {}

  /** Creează sau actualizează bindingul (upsert). */
  async upsert(
    userId: string,
    role: RoleBinding['role'],
    resourceId: string,
    resourceType: string,
  ) {
    return this.model.updateOne(
      { userId, resourceId, resourceType },
      { $set: { role } },
      { upsert: true },
    );
  }

  async revoke(userId: string, resourceId: string, resourceType: string) {
    return this.model.deleteOne({ userId, resourceId, resourceType });
  }

  async listForResource(resourceId: string, resourceType = 'restaurant') {
    return this.model.find({ resourceId, resourceType });
  }

  async listForUser(userId: string) {
    return this.model.find({ userId });
  }
}
