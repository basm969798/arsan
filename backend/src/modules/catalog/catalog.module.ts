import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './domain/entities/category.entity';
import { Part } from './domain/entities/part.entity';
import { CatalogController } from './api/controllers/catalog.controller';
import { CatalogService } from './application/services/catalog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Part])],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [TypeOrmModule, CatalogService],
})
export class CatalogModule {}
