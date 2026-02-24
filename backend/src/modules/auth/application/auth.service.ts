import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<{ id: string }> {
    if (email === 'admin@arsan.com' && password === 'admin123') {
      return { id: 'user_1' };
    }

    throw new UnauthorizedException();
  }

  async login(userId: string) {
    const payload = { sub: userId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
