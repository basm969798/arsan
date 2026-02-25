import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthService } from '../../application/services/auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { CompaniesService } from '../../../companies/application/services/companies.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const company = await this.companiesService.createCompany(dto.companyName);
    const user = await this.usersService.createUser(company.id, dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
