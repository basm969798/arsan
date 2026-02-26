import { Entity, Column, Index, VersionColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';
import { Category } from './category.entity';

@Entity('parts')
export class Part extends BaseEntity {
  @Index('IDX_PART_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index('IDX_PART_OEM')
  @Column({ type: 'varchar', length: 100 })
  oemNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @VersionColumn()
  version: number;
}
