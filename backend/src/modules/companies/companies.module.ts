import { Module } from '@nestjs/common';
import { CompaniesController } from './api/companies.controller';
import { CompaniesService } from './application/companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
})
export class CompaniesModule {}
