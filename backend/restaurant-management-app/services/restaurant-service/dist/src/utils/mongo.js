"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectId = toObjectId;
const mongoose_1 = require("mongoose");
function toObjectId(id) {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new mongoose_1.Types.ObjectId(id);
}
//# sourceMappingURL=mongo.js.map