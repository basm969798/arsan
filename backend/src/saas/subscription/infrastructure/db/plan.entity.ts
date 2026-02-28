import { Entity, Column } from 'typeorm';
// 🛡️ الربط بـ BaseEntity لضمان التوقيت الموحد وعزل البيانات (Rules 2.1 & 9)
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('plans')
export class PlanEntity extends BaseEntity { // 👈 الوراثة تجعل الكيان "قانونياً"

  // 🛡️ ملاحظة: تم حذف id و createdAt لأنها موروثة من الأب (BaseEntity)
  // هذا يمنع تعارض الأنواع في TypeScript ويحقق قاعدة البيانات النظيفة.

  @Column()
  name: string; // مثال: Basic, Pro, Enterprise

  // 🛡️ دقة مالية عالية التزاماً بالبند 5.3
  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ['MONTHLY', 'YEARLY'],
    default: 'MONTHLY'
  })
  billingCycle: 'MONTHLY' | 'YEARLY';

  // 🛡️ حدود الاستخدام (Usage Limits)
  @Column({ default: 5 })
  maxUsers: number;

  @Column({ default: 100 })
  maxOrdersPerMonth: number;

  @Column({ type: 'jsonb', nullable: true })
  featureFlags: Record<string, boolean>;

  /**
   * 💡 ملاحظة معمارية: 
   * الخطط عادة ما تكون على مستوى النظام (System-level)، 
   * لذا حقل company_id الموروث يمكن أن يترك فارغاً للخطط العامة 
   * أو يستخدم لإنشاء خطط مخصصة لشركات معينة (Custom Plans).
   */
}
