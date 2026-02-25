import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class DomainEventBus extends EventEmitter {
  publish(eventType: string, payload: any): void {
    console.log(`[EventBus] Publishing event: ${eventType}`);
    this.emit(eventType, payload);
  }
}
