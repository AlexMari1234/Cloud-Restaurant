"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSchema = exports.Table = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Table = class Table extends mongoose_2.Document {
    restaurantId;
    number;
    capacity;
    type;
    isActive;
    unavailableDays;
    minReservationTime;
    maxReservationTime;
};
exports.Table = Table;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Restaurant', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Table.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Table.prototype, "number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Table.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['indoor', 'outdoor', 'bar'], required: true }),
    __metadata("design:type", String)
], Table.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], Table.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Table.prototype, "unavailableDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Table.prototype, "minReservationTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Table.prototype, "maxReservationTime", void 0);
exports.Table = Table = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Table);
exports.TableSchema = mongoose_1.SchemaFactory.createForClass(Table);
exports.TableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
exports.TableSchema.index({ restaurantId: 1, type: 1 });
exports.TableSchema.index({ restaurantId: 1, capacity: 1 });
//# sourceMappingURL=table.schema.js.map