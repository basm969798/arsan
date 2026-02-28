import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { IDomainEvent, IEventBus } from './event-bus.interface';

@Injectable()
export class DomainEventBus extends EventEmitter implements IEventBus {
  async publish(event: IDomainEvent): Promise<void> {
    console.log(`[EventBus] Publishing event: ${event.type}`);
    this.emit(event.type, event);
  }
}
