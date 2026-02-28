import { Entity, Column } from 'typeorm';
// 🛡️ الربط بالدستور لضمان عزل الشركات (Rule 2.1)
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('financial_events')
export class FinancialEvent extends BaseEntity {

  // 🛡️ البند 5.3: يجب أن يحتوي كل حدث مالي على مرجع (Reference ID)
  @Column({ name: 'reference_id' })
  reference_id: string; // كان يسمى order_id، تم تعميمه ليتوافق مع الدستور

  @Column({
    type: 'enum',
    enum: ['PAYMENT', 'REFUND', 'REVENUE_SHARE', 'FEE'],
  })
  event_type: string;

  // 🛡️ الدقة المالية (Rule 5.3): استخدام 12 رقماً مع منزلتين عشريتين
  @Column('decimal', { 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  amount: number;

  @Column()
  currency: string;

  
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}