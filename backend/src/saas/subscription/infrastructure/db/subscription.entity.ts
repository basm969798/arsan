import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// 🛡️ استيراد القاعدة الأساسية لضمان عزل الشركات والتواريخ الموحدة
import { BaseEntity } from '../../../../common/database/base.entity';
import { Company } from '../../../company/infrastructure/db/company.entity';
import { PlanEntity } from './plan.entity';

@Entity('subscriptions')
export class SubscriptionEntity extends BaseEntity { // 👈 الوراثة من BaseEntity

  // 🛡️ ملاحظة: تم حذف id و companyId و createdAt و updated_at 
  // لأنها أصبحت موروثة تلقائياً من BaseEntity. تكرارها هنا يسبب خطأ TypeScript.

  @Column({ type: 'uuid' })
  planId: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'EXPIRED'],
    default: 'TRIAL'
  })
  status: string;

  // 🛡️ التزاماً بالبند رقم 9: التواريخ ستعامل كـ UTC
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  // --- العلاقات (Relations) ---

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' }) // تأكد أن الاسم يطابق الحقل في BaseEntity
  company: Company;

  @ManyToOne(() => PlanEntity)
  @JoinColumn({ name: 'planId' })
  plan: PlanEntity;
}