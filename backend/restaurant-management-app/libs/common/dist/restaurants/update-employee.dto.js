"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmployeeDTO = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_employee_dto_1 = require("./create-employee.dto");
class UpdateEmployeeDTO extends (0, mapped_types_1.PartialType)(create_employee_dto_1.CreateEmployeeDTO) {
}
exports.UpdateEmployeeDTO = UpdateEmployeeDTO;
//# sourceMappingURL=update-employee.dto.js.map