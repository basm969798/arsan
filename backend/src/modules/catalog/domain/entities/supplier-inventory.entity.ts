import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TechnicalPart } from './technical-part.entity';

@Entity('supplier_inventories')
export class SupplierInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => TechnicalPart, part => part.inventories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'technicalPartId' })
  technicalPart: TechnicalPart;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
