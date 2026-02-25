import { Entity, Column, Index, VersionColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';
import { OrderItem } from './order-item.entity';
import { Offer } from './offer.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Index('IDX_ORDER_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Offer, (offer) => offer.order, { cascade: true })
  offers: Offer[];

  @VersionColumn()
  version: number;
}
