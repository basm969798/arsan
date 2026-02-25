import { Module, Global } from '@nestjs/common';
import { SearchService } from './application/services/search.service';
import { SearchController } from './api/controllers/search.controller';

@Global()
@Module({
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
