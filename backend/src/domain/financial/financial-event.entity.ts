import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, BeforeUpdate, BeforeRemove } from 'typeorm';

export enum FinancialEventType {
  DEBT_REGISTERED = 'FINANCIAL_DEBT_REGISTERED',
  PAYMENT_REGISTERED = 'FINANCIAL_PAYMENT_REGISTERED',
  REVERSAL = 'FINANCIAL_REVERSAL'
}

@Entity('financial_events')
@Index(['companyId', 'referenceId']) 
export class FinancialEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  referenceId: string; 

  @Column({ type: 'enum', enum: FinancialEventType })
  eventType: FinancialEventType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; 

  @Column({ type: 'varchar', length: 3, default: 'SAR' })
  currency: string;

  @Column({ type: 'uuid' })
  actorId: string; 

  @CreateDateColumn({ type: 'timestamptz' }) 
  timestamp: Date;

  @Column({ type: 'varchar', unique: true }) 
  idempotencyKey: string;

  @BeforeUpdate()
  preventUpdate() {
    throw new Error("FINANCIAL_IMMUTABILITY_VIOLATION: Financial events are append-only. UPDATE is strictly forbidden.");
  }

  @BeforeRemove()
  preventDelete() {
    throw new Error("FINANCIAL_IMMUTABILITY_VIOLATION: Financial events are append-only. DELETE is strictly forbidden.");
  }
}