import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './infrastructure/db/company.entity';
import { CreateCompanyHandler } from './application/handlers/create-company.handler';
import { TypeOrmCompanyRepository } from './infrastructure/repositories/typeorm-company.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [
    {
      provide: 'ICompanyRepository',
      useClass: TypeOrmCompanyRepository,
    },
    {
      provide: CreateCompanyHandler,
      useFactory: (repo: TypeOrmCompanyRepository) => new CreateCompanyHandler(repo),
      inject: ['ICompanyRepository'],
    },
  ],
  exports: [CreateCompanyHandler],
})
export class CompanyModule {}
