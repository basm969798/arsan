import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../db/subscription.entity';
import { ISubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import { BaseRepository } from '../../../../common/database/base.repository';

export class TypeOrmSubscriptionRepository 
  extends BaseRepository<SubscriptionEntity> 
  implements ISubscriptionRepository 
{
  constructor(
    @InjectRepository(SubscriptionEntity)
    subRepo: Repository<SubscriptionEntity>,
  ) {
    super(subRepo.target, subRepo.manager, subRepo.queryRunner);
  }

  async createTrial(companyId: string, planId: string, startDate: Date, endDate: Date): Promise<any> {
    // 1. تجهيز البيانات (Mapping)
    const subscriptionData = {
      company_id: companyId, 
      planId,
      startDate,
      endDate,
      status: 'TRIAL'
    };

    // 2. إنشاء الكيان
    const subscription = this.create(subscriptionData as any);

    // 3. 🛡️ الحل القطعي للنوع: نستخدم unknown كجسر
    const saved = (await this.save(subscription)) as any;

    // 4. 🛡️ حل مشكلة التسمية: نستخدم ["property"] للوصول الآمن إذا لم يراها TS
    return {
      ...saved,
      companyId: saved["company_id"] || companyId // نضمن وجود المعرف في كل الأحوال
    };
  }
}