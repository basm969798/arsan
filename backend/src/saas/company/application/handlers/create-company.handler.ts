import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';

export class CreateCompanyHandler {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async handle(name: string, ownerUserId: string) {
    // تطبيق البند 3.1: إنشاء الشركة مع الحالة الافتراضية TRIAL
    return await this.companyRepository.save({
      name,
      owner_user_id: ownerUserId,
      status: 'TRIAL' 
    });
  }
}
