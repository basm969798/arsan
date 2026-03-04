// backend/src/domain/system-events/event-store.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemEvent } from './system-event.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(SystemEvent)
    private eventRepo: Repository<SystemEvent>,
  ) {}

  // الدالة التي كانت ناقصة وتسببت في الخطأ
  async saveEvent(data: {
    aggregateId: string;
    aggregateType: string;
    eventType: string;
    companyId: string;
    actorId: string;
    version: number;
    payload: any;
  }) {
    const event = this.eventRepo.create(data);
    return await this.eventRepo.save(event);
  }
}