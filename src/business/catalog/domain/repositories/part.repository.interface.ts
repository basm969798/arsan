import { PartEntity } from '../../infrastructure/db/part.entity';

export interface IPartRepository {
  save(part: Partial<PartEntity>): Promise<PartEntity>;
  findBySku(sku: string): Promise<PartEntity | null>;
  findAll(): Promise<PartEntity[]>;
}
