import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🔓 LOGIN ROUTE
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.userId);
  }

  // 🔐 PROTECTED ROUTE
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Request() req) {
    return req.user;
  }
}