import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [UsersModule, CompaniesModule],
  controllers: [AuthController],
})
export class AuthModule {}
