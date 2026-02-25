import { Injectable } from '@nestjs/common';

@Injectable()
export class DomainEventBus {
  publish(event: any): void {
    console.log('[EventBus] Published event:', event?.eventType);
  }
}
