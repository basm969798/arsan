import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './domain/entities/company.entity';
import { CompaniesService } from './application/services/companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompaniesService],
  exports: [TypeOrmModule, CompaniesService],
})
export class CompaniesModule {}
