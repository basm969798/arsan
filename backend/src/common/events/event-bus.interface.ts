// backend/src/common/events/event-bus.interface.ts

export interface IDomainEvent {
  type: string;
  companyId: string;
  payload: any;
  occurredAt: Date;
}

export interface IEventBus {
  
  publish(event: IDomainEvent): Promise<void>;
}