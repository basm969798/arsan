// backend/src/domain/system-events/system-event.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('system_events')
@Unique('uq_events_version', ['aggregateId', 'version']) // حماية من تضارب النسخ
@Index('idx_events_company', ['companyId'])               // عزل أداء الشركات
export class SystemEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'aggregate_type', type: 'varchar', length: 100 })
  aggregateType: string;

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'company_id', type: 'uuid' }) // إلغاء nullable لضمان عزل البيانات
  companyId: string;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}