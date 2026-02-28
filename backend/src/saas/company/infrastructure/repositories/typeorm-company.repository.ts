import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../db/company.entity';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';

export class TypeOrmCompanyRepository implements ICompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
  ) {}

  async save(company: Partial<Company>): Promise<Company> {
    return await this.repository.save(company);
  }

  async findById(id: string): Promise<Company | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByOwner(ownerId: string): Promise<Company[]> {
    return await this.repository.find({ where: { owner_user_id: ownerId } });
  }
}
