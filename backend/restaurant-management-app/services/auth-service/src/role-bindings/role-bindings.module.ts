// src/role-bindings/role-bindings.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RoleBinding,
  RoleBindingSchema,
} from './role-binding.schema';
import { RoleBindingsService } from './role-bindings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleBinding.name, schema: RoleBindingSchema },
    ]),
  ],
  providers: [RoleBindingsService],
  exports: [RoleBindingsService],   // <- important!
})
export class RoleBindingsModule {}
