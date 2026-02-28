import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PartEntity } from '../db/part.entity';
import { IPartRepository } from '../../domain/repositories/part.repository.interface';

/**
 * تنفيذ مستودع القطع باستخدام TypeORM
 * تم التصحيح ليتوافق مع واجهة IPartRepository
 */
export class TypeOrmPartRepository implements IPartRepository {
  constructor(
    @InjectRepository(PartEntity)
    private readonly repository: Repository<PartEntity>,
  ) {}

  async save(part: Partial<PartEntity>): Promise<PartEntity> {
    return await this.repository.save(part);
  }

  async findBySku(sku: string): Promise<PartEntity | null> {
    // تصحيح: البحث باستخدام sku الممرر مباشرة
    return await this.repository.findOne({ where: { sku } } as any);
  }

  async findAll(): Promise<PartEntity[]> {
    return await this.repository.find();
  }
}
