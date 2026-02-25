import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
