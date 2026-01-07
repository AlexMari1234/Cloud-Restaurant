import { SetMetadata } from '@nestjs/common';
import { OrderTopic } from '../constants/topics';

export const KAFKA_LISTENER = 'kafka:listener';

export interface KafkaListenerOptions {
  topic: OrderTopic;
  groupId?: string;
}

export const KafkaListener = (options: KafkaListenerOptions) => 
  SetMetadata(KAFKA_LISTENER, options); 