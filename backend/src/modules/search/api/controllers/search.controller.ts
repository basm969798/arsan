import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from '../../application/services/search.service';
import { SearchQueryDto } from '../dtos/search-query.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('parts')
  async search(@Query() dto: SearchQueryDto) {
    return this.searchService.searchParts(dto.query);
  }
}
