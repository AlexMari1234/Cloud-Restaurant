"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaListener = exports.KAFKA_LISTENER = void 0;
const common_1 = require("@nestjs/common");
exports.KAFKA_LISTENER = 'kafka:listener';
const KafkaListener = (options) => (0, common_1.SetMetadata)(exports.KAFKA_LISTENER, options);
exports.KafkaListener = KafkaListener;
//# sourceMappingURL=kafka.decorator.js.map