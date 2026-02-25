import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('financial_records')
export class FinancialRecord extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  companyId: string;

  @Index()
  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'CASH' | 'DEBT';

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note: string;
}
