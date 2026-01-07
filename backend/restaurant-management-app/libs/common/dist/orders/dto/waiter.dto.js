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
exports.AddBatchToOrderDto = exports.CompletePaymentDto = exports.RequestPaymentDto = exports.ServeBatchDto = exports.UpdateBatchStatusDto = exports.KitchenAcceptBatchDto = exports.SendBatchToKitchenDto = exports.AddItemToOrderDto = exports.CreateDineInOrderDto = exports.CreateDineInOrderBatchDto = exports.CreateDineInOrderItemDto = exports.WaiterCompleteOrderDto = exports.WaiterServeOrderDto = exports.WaiterAcceptOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WaiterAcceptOrderDto {
    note;
}
exports.WaiterAcceptOrderDto = WaiterAcceptOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when accepting the order',
        example: 'Will serve to table 5',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterAcceptOrderDto.prototype, "note", void 0);
class WaiterServeOrderDto {
    note;
}
exports.WaiterServeOrderDto = WaiterServeOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when serving the order',
        example: 'Served hot and fresh to table 5',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterServeOrderDto.prototype, "note", void 0);
class WaiterCompleteOrderDto {
    note;
}
exports.WaiterCompleteOrderDto = WaiterCompleteOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when completing the order',
        example: 'Customer satisfied, payment processed',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterCompleteOrderDto.prototype, "note", void 0);
class CreateDineInOrderItemDto {
    productId;
    quantity;
    specialInstructions;
}
exports.CreateDineInOrderItemDto = CreateDineInOrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product ID from menu',
        example: '675abc123def456789012345'
    }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateDineInOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity of the product',
        example: 2
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDineInOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Special instructions for this item',
        example: 'No onions, extra cheese',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDineInOrderItemDto.prototype, "specialInstructions", void 0);
class CreateDineInOrderBatchDto {
    items;
    batchNote;
}
exports.CreateDineInOrderBatchDto = CreateDineInOrderBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of items in this batch',
        type: [CreateDineInOrderItemDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateDineInOrderItemDto),
    __metadata("design:type", Array)
], CreateDineInOrderBatchDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for this batch',
        example: 'First course - appetizers',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDineInOrderBatchDto.prototype, "batchNote", void 0);
class CreateDineInOrderDto {
    customerEmail;
    tableNumber;
    batches;
    orderNotes;
    customerName;
}
exports.CreateDineInOrderDto = CreateDineInOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email to identify/create customer account',
        example: 'customer@example.com'
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDineInOrderDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Table number for dine-in service',
        example: 5
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateDineInOrderDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of batches, each containing items',
        type: [CreateDineInOrderBatchDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateDineInOrderBatchDto),
    __metadata("design:type", Array)
], CreateDineInOrderDto.prototype, "batches", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional order notes',
        example: 'Customer has nut allergy',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDineInOrderDto.prototype, "orderNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional customer name for reservation reference',
        example: 'John Doe',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDineInOrderDto.prototype, "customerName", void 0);
class AddItemToOrderDto {
    productId;
    quantity;
    specialInstructions;
}
exports.AddItemToOrderDto = AddItemToOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product ID to add',
        example: '675abc123def456789012345'
    }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], AddItemToOrderDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity to add',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddItemToOrderDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Special instructions for this item',
        example: 'Extra spicy',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddItemToOrderDto.prototype, "specialInstructions", void 0);
class SendBatchToKitchenDto {
    batchNumber;
    kitchenNote;
}
exports.SendBatchToKitchenDto = SendBatchToKitchenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batch number to send to kitchen (1, 2, 3, etc.)',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SendBatchToKitchenDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for the kitchen',
        example: 'Customer is in a hurry',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendBatchToKitchenDto.prototype, "kitchenNote", void 0);
class KitchenAcceptBatchDto {
    batchNumber;
    note;
}
exports.KitchenAcceptBatchDto = KitchenAcceptBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batch number to accept',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KitchenAcceptBatchDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when accepting the batch',
        example: 'All items in batch are feasible',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenAcceptBatchDto.prototype, "note", void 0);
class UpdateBatchStatusDto {
    batchNumber;
    batchStatus;
    note;
    itemStatuses;
}
exports.UpdateBatchStatusDto = UpdateBatchStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batch number to update',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBatchStatusDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status for all items in batch',
        example: 'PREPARING',
        enum: ['KITCHEN_ACCEPTED', 'PREPARING', 'READY']
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBatchStatusDto.prototype, "batchStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for batch update',
        example: 'All items in batch are being prepared',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBatchStatusDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional array for updating status of individual items in batch',
        required: false,
        type: [Object],
        example: [
            { productId: '68415844316a7bab4b7a6233', status: 'PREPARING' }
        ]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateBatchStatusDto.prototype, "itemStatuses", void 0);
class ServeBatchDto {
    batchNumber;
    note;
}
exports.ServeBatchDto = ServeBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Batch number to serve',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ServeBatchDto.prototype, "batchNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when serving',
        example: 'Served hot to table 5',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ServeBatchDto.prototype, "note", void 0);
class RequestPaymentDto {
    note;
}
exports.RequestPaymentDto = RequestPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for payment request',
        example: 'Customer ready to pay',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequestPaymentDto.prototype, "note", void 0);
class CompletePaymentDto {
    paymentMethod;
    amountPaid;
    note;
}
exports.CompletePaymentDto = CompletePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method used',
        example: 'CARD',
        enum: ['CASH', 'CARD', 'DIGITAL']
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompletePaymentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount paid by customer',
        example: 45.50
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CompletePaymentDto.prototype, "amountPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for payment completion',
        example: 'Customer satisfied',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompletePaymentDto.prototype, "note", void 0);
class AddBatchToOrderDto {
    items;
    batchNote;
    sendToKitchen;
}
exports.AddBatchToOrderDto = AddBatchToOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of items in this new batch',
        type: [CreateDineInOrderItemDto]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateDineInOrderItemDto),
    __metadata("design:type", Array)
], AddBatchToOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note for the batch',
        example: 'Customer ordered desserts',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddBatchToOrderDto.prototype, "batchNote", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Send directly to kitchen after adding',
        example: true,
        required: false
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AddBatchToOrderDto.prototype, "sendToKitchen", void 0);
//# sourceMappingURL=waiter.dto.js.map