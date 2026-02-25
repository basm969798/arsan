import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './application/services/search.service';
import { SearchController } from './api/controllers/search.controller';
import { Part } from '../catalog/domain/entities/part.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Part])],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
