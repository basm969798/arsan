import { Company } from '../../infrastructure/db/company.entity';

export interface ICompanyRepository {
  save(company: Partial<Company>): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByOwner(ownerId: string): Promise<Company[]>;
}
