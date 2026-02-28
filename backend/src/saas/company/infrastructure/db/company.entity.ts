import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  owner_user_id: string;

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED'],
    default: 'TRIAL'
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
