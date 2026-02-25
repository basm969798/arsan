import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    // التصحيح هنا: أضفنا كلمة return لكي تصل البيانات للمستخدم
    return await this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@CurrentUser() user: any) {
    return user;
  }
}