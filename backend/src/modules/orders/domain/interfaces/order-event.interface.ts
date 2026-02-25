export interface IDomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  timestamp: Date;
  version: number;
  payload: any;
}
