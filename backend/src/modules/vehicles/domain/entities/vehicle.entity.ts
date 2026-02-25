import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('vehicles')
@Index(['make', 'model'])
export class Vehicle extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'int' })
  startYear: number;

  @Column({ type: 'int' })
  endYear: number;
}
