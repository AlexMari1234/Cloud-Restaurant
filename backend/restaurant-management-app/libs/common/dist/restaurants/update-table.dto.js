"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTableDTO = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_table_dto_1 = require("./create-table.dto");
class UpdateTableDTO extends (0, mapped_types_1.PartialType)(create_table_dto_1.CreateTableDTO) {
}
exports.UpdateTableDTO = UpdateTableDTO;
//# sourceMappingURL=update-table.dto.js.map