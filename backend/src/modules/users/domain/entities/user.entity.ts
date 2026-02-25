import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index('IDX_USER_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;
}
