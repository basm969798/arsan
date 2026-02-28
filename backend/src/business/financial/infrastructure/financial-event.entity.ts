import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('financial_events')
export class FinancialEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  order_id: string;

  @Column({
    type: 'enum',
    enum: ['PAYMENT', 'REFUND', 'REVENUE_SHARE', 'FEE'],
  })
  event_type: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @CreateDateColumn()
  occurred_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}
