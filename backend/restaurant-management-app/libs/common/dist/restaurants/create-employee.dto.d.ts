export declare class CreateEmployeeDTO {
    userId: string;
    roleLabel: 'chef' | 'waiter' | 'cashier' | 'manager' | 'assistant_chef' | 'driver';
    hourlyRate: number;
}
export declare class CreateShiftDto {
    employeeId: string;
    startTime: Date;
    endTime: Date;
}
export declare class UpdateShiftDto {
    startTime?: Date;
    endTime?: Date;
    status?: 'scheduled' | 'completed' | 'missed';
}
//# sourceMappingURL=create-employee.dto.d.ts.map