import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RegisterUserCommand } from '../../application/commands/register-user.command';
import { RegisterUserHandler } from '../../application/handlers/register-user.handler';

/**
 * بوابة الهوية - المسؤولة عن استقبال طلبات التسجيل والدخول
 * مطابقة للبند 3.4 من دستور المعمارية: Thin Controllers.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly registerHandler: RegisterUserHandler) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    // تحويل البيانات القادمة إلى "أمر" (Command)
    const command = new RegisterUserCommand(dto);
    
    // إرسال الأمر للمحرك للحصول على النتيجة
    const user = await this.registerHandler.handle(command);

    return {
      message: 'User registered successfully',
      userId: user.id,
      email: user.email
    };
  }
}
