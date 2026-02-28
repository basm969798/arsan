import { Entity, Column, VersionColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

@Entity('orders')
export class Order extends BaseEntity {

  @Column()
  @Index({ unique: true })
  order_number: string;

  @Column({ default: 'PENDING' })
  status: string;

  // 🛡️ حماية البند 5.2: جعل السعر خاصاً للتحكم في التعديل
  @Column('decimal', { 
    name: 'locked_price',
    precision: 12, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  private _locked_price: number;

  // 🛡️ الـ Setter هو الحارس (Guard) الذي يمنع كسر الـ Invariant
  set locked_price(value: number) {
    // إذا كانت الحالة ليست PENDING، يُمنع تغيير السعر نهائياً
    if (this.status !== 'PENDING' && this._locked_price !== undefined) {
      throw new Error('INVARIANT_VIOLATION: Price is locked and cannot be modified after ACCEPTED state.');
    }
    this._locked_price = value;
  }

  get locked_price(): number {
    return this._locked_price;
  }

  @VersionColumn()
  version: number;
}
