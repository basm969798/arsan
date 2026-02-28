import { Repository, DeleteResult } from 'typeorm';
import { BaseEntity } from './base.entity';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseRepository<T extends BaseEntity> 
  extends Repository<T> 
  implements IBaseRepository<T> {

  async findById(id: string, companyId: string): Promise<T | null> {
    // تطبيق البند 2.1: العزل الإجباري للمستأجر
    return this.findOne({
      where: { id, companyId } as any
    });
  }

 
  async delete(criteria: any): Promise<DeleteResult> {
    throw new Error('INVARIANT_VIOLATION: Hard delete is strictly forbidden by SYSTEM_INVARIANTS.md');
  }
}