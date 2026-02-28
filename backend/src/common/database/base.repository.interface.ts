import { UpdateResult } from 'typeorm';

export interface IBaseRepository<T> {
  // 🛡️ البحث يتطلب دائماً companyId لضمان عزل البيانات (Rule 2.1)
  findById(id: string, company_id: string): Promise<T | null>;

  // 🛡️ البحث العام مع خيارات إضافية
  find(options?: any): Promise<T[]>;

  // 🛡️ الحفظ (إنشاء أو تحديث كلي)
  save(entity: T): Promise<T>;

  // 🛡️ التحديث الجزئي (يعيد UpdateResult للتوافق مع TypeORM)
  update(id: string, data: any): Promise<UpdateResult>;

  // 🚫 ملاحظة: لا نضع دالة delete هنا تطبيقاً للبند 5.1 (حظر الحذف النهائي)
}