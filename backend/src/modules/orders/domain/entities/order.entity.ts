import { Entity, Column, Index, VersionColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order extends BaseEntity {
  @Index('IDX_ORDER_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @VersionColumn()
  version: number;
}
