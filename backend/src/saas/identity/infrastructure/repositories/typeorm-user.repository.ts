import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../db/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IUser } from '../../domain/models/user.interface';
import { BaseRepository } from '../../../../common/database/base.repository';

export class TypeOrmUserRepository 
  extends BaseRepository<UserEntity> 
  implements IUserRepository 
{
  constructor(
    @InjectRepository(UserEntity)
    userRepo: Repository<UserEntity>,
  ) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ where: { email } as any });
  }

  async saveUser(user: Partial<IUser>): Promise<IUser> {
    const newUser = this.create(user as UserEntity);
    return await this.save(newUser);
  }

  /**
   * 🛡️ تنفيذ دالة patch التي تطلبها الواجهة
   * نقوم باستدعاء super.update (دالة TypeORM الأصلية) داخلياً
   */
  async patch(id: string, user: Partial<IUser>): Promise<void> {
    await super.update(id, user as any);
    return; // إرجاع void صريح لإرضاء TypeScript
  }
}