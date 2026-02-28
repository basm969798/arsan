import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../db/company.entity';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { BaseRepository } from '../../../../common/database/base.repository';

export class TypeOrmCompanyRepository 
  extends BaseRepository<Company> 
  implements ICompanyRepository 
{
  constructor(
    @InjectRepository(Company)
    companyRepo: Repository<Company>, // 🛡️ حذفنا private readonly هنا
  ) {
    super(companyRepo.target, companyRepo.manager, companyRepo.queryRunner);
  }

  // 🛡️ حل تعارض findById:
  // بما أن البحث عن "شركة" يتم بمعرفها، والواجهة تطلب id فقط، نقوم بتجاوز (Override) دالة الأب
  async findById(id: string): Promise<Company | null> {
    return await this.findOne({ where: { id } as any });
  }

  async saveCompany(company: Partial<Company>): Promise<Company> {
    return await this.save(company as Company);
  }

  async findByOwner(ownerId: string): Promise<Company[]> {
    return await this.find({ where: { owner_user_id: ownerId } as any });
  }
}