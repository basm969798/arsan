import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(userId: string) {
    const payload = { sub: userId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
