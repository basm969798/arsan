import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '../../users/application/services/users.service';
import { CompaniesService } from '../../companies/application/services/companies.service';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const company = await this.companiesService.createCompany(dto.companyName);
    const user = await this.usersService.createUser(company.id, dto.email, dto.password);

    return {
      message: 'Registration successful',
      companyId: company.id,
      userId: user.id,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      return { error: 'Invalid credentials' };
    }

    return {
      message: 'Login successful',
      userId: user.id,
      companyId: user.companyId,
      token: 'jwt_placeholder_for_next_step'
    };
  }
}
