import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../users/application/services/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('Login attempt for:', email);
    const user = await this.usersService.findByEmail(email);
    console.log('User found in DB:', !!user);
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      console.log('Password match result:', isMatch);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, companyId: user.companyId };
    return {
      access_token: this.jwtService.sign(payload),
      userId: user.id,
      companyId: user.companyId
    };
  }
}
