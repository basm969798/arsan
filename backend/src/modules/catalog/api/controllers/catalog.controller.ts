import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { CatalogService } from '../../application/services/catalog.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { CreatePartDto } from '../dtos/create-part.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post('categories')
  async createCategory(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(user.companyId, dto);
  }

  @Post('parts')
  async createPart(@CurrentUser() user: any, @Body() dto: CreatePartDto) {
    return this.catalogService.createPart(user.companyId, dto);
  }

  @Get()
  async getMyCatalog(@CurrentUser() user: any) {
    return this.catalogService.getCatalog(user.companyId);
  }
}
