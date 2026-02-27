import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SupplierInventory } from './supplier-inventory.entity';

export enum PartStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }

@Entity('technical_parts')
export class TechnicalPart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  partNumber: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  compatibleVehicles: any;

  @Column({ type: 'enum', enum: PartStatus, default: PartStatus.PENDING })
  status: PartStatus;

  @OneToMany(() => SupplierInventory, inventory => inventory.technicalPart)
  inventories: SupplierInventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
