import { Entity, Column, Index, VersionColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/database/base.entity';
import { OrderItem } from './order-item.entity';
import { Offer } from './offer.entity';

export enum OrderType { DIRECT = 'DIRECT', PUBLIC = 'PUBLIC' }
export enum OrderStatus { NEW = 'NEW', PENDING_SUPPLIER = 'PENDING_SUPPLIER', ACCEPTED = 'ACCEPTED', PROCESSING = 'PROCESSING', READY = 'READY', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED', REJECTED = 'REJECTED' }

@Entity('orders')
export class Order extends BaseEntity {
  @Index('IDX_ORDER_COMPANY')
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  createdById: string;

  @Column({ type: 'varchar', length: 50, default: 'DIRECT' })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceAtAcceptance: number;

  @Column({ unique: true, nullable: true })
  idempotencyKey: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Offer, (offer) => offer.order, { cascade: true })
  offers: Offer[];

  @VersionColumn()
  version: number;
}
