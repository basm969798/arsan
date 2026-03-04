import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { OfferState } from './offer.enums';

@Entity('offers')
// الفهرس (Index) يضمن سرعة البحث عن عروض شركة معينة لطلب معين
@Index('idx_offers_lookup', ['companyId', 'orderId']) 
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' }) // صريح
  companyId: string;

  @Column({ name: 'order_id', type: 'uuid' }) // صريح
  orderId: string;

  @Column({ name: 'supplier_id', type: 'uuid' }) // صريح
  supplierId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 }) // زيادة الدقة المالية
  price: number;

  @Column({ 
    type: 'enum', 
    enum: OfferState, 
    default: OfferState.CREATED 
  })
  status: OfferState;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) // صريح
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) // صريح
  updatedAt: Date;
}