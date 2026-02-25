import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  companyId: string;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;
}
