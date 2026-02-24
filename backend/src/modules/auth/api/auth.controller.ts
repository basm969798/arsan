import { Controller, Get } from '@nestjs/common';
import { AuthService } from '../application/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  login() {
    return this.authService.login('test-user-id');
  }
}
