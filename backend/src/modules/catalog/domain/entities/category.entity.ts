import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Index('IDX_CATEGORY_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
