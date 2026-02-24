import { Module } from '@nestjs/common';
import { CatalogController } from './api/catalog.controller';
import { CatalogService } from './application/catalog.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
