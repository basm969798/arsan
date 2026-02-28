import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../db/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IUser } from '../../domain/models/user.interface';

export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async save(user: Partial<IUser>): Promise<IUser> {
    const newUser = this.repository.create(user as UserEntity);
    return await this.repository.save(newUser);
  }

  async update(id: string, user: Partial<IUser>): Promise<void> {
    await this.repository.update(id, user as UserEntity);
  }
}
