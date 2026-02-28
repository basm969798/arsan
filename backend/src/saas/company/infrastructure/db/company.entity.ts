import { Entity, Column } from 'typeorm';
// 🛡️ استيراد القاعدة الأساسية لضمان توحيد الحقول والتواريخ
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('companies')
export class Company extends BaseEntity { // 👈 الوراثة من BaseEntity هي الحل!

  // 🛡️ ملاحظة: تم حذف id و created_at و updated_at 
  // لأنها موروثة الآن من BaseEntity. تكرارها هنا هو سبب الأخطاء الحمراء.

  @Column()
  name: string;

  @Column({ type: 'uuid', name: 'owner_user_id' })
  owner_user_id: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED'],
    default: 'TRIAL'
  })
  status: string;

  
}