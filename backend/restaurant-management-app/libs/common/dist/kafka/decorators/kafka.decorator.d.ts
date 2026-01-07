import { OrderTopic } from '../constants/topics';
export declare const KAFKA_LISTENER = "kafka:listener";
export interface KafkaListenerOptions {
    topic: OrderTopic;
    groupId?: string;
}
export declare const KafkaListener: (options: KafkaListenerOptions) => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=kafka.decorator.d.ts.map