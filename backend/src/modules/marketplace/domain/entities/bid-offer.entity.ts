import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PublicBid } from './public-bid.entity';

@Entity('bid_offers')
export class BidOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PublicBid, bid => bid.offers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publicBidId' })
  publicBid: PublicBid;

  @Column()
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  offeredPrice: number;

  @Column({ default: false })
  isAccepted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
