import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BidOffer } from './bid-offer.entity';

export enum BidStatus { OPEN = 'OPEN', CLOSED = 'CLOSED' }

@Entity('public_bids')
export class PublicBid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  traderId: string;

  @Column()
  technicalPartId: string;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.OPEN })
  status: BidStatus;

  @OneToMany(() => BidOffer, offer => offer.publicBid)
  offers: BidOffer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
