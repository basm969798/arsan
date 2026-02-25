import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    // mock user فقط (Phase 2)
    if (email === 'test@test.com' && password === '123456') {
      return {
        id: 'user_1',
      };
    }

    throw new UnauthorizedException();
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}