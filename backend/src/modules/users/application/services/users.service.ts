import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(companyId: string, email: string, passwordPlain: string): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user = this.userRepository.create({ companyId, email, passwordHash });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
