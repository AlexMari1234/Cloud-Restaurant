export declare enum StaffRole {
    CHEF = "CHEF",
    ASSISTANT_CHEF = "ASSISTANT_CHEF",
    WAITER = "WAITER",
    DRIVER = "DRIVER"
}
export declare class OrderAssignmentDto {
    orderId: string;
    chefId: string;
    assistantChefId?: string;
    waiterId?: string;
    driverId?: string;
    estimatedPrepTime: number;
    estimatedDeliveryTime?: number;
}
export declare class KitchenConfirmationDto {
    orderId: string;
    chefId: string;
    assistantChefId?: string;
    estimatedPrepTime: number;
    kitchenNotes?: string;
}
export declare class StaffAssignmentDto {
    orderId: string;
    staffId: string;
    role: StaffRole;
    estimatedTime?: number;
}
//# sourceMappingURL=order-assignment.dto.d.ts.map