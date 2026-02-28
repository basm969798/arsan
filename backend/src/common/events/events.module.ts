import { Module, Global } from '@nestjs/common';
import { DomainEventBus } from './domain-event.bus';

@Global()
@Module({
  providers: [
    DomainEventBus,
    {
      provide: 'IEventBus',
      useExisting: DomainEventBus,
    },
  ],
  exports: [DomainEventBus, 'IEventBus'],
})
export class EventsModule {}
