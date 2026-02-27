import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LedgerEventType { DEBT_CREATED = 'DEBT_CREATED', PAYMENT_MADE = 'PAYMENT_MADE', SETTLED = 'SETTLED' }

@Entity('financial_ledger')
export class FinancialLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LedgerEventType })
  eventType: LedgerEventType;

  @Column({ nullable: true })
  orderId: string;

  @Column()
  debtorId: string;

  @Column()
  creditorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  timestamp: Date;
}
