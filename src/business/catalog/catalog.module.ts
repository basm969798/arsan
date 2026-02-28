import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartEntity } from './infrastructure/db/part.entity';
import { TypeOrmPartRepository } from './infrastructure/repositories/typeorm-part.repository';
import { CreatePartHandler } from './application/handlers/create-part.handler';
import { PricingService } from './domain/services/pricing.service';
import { CatalogController } from './infrastructure/controllers/catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartEntity])],
  controllers: [CatalogController],
  providers: [
    PricingService,
    {
      provide: 'IPartRepository',
      useClass: TypeOrmPartRepository,
    },
    {
      provide: CreatePartHandler,
      useFactory: (repo: TypeOrmPartRepository, pricing: PricingService) => 
        new CreatePartHandler(repo, pricing),
      inject: ['IPartRepository', PricingService],
    },
  ],
  exports: [CreatePartHandler],
})
export class CatalogModule {}
