import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('parts')
export class Part extends BaseEntity {
  @Index('IDX_PART_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

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
