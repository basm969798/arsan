import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../domain/entities/category.entity';
import { Part } from '../../domain/entities/part.entity';
import { CreateCategoryDto } from '../../api/dtos/create-category.dto';
import { CreatePartDto } from '../../api/dtos/create-part.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  async createCategory(companyId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create({ ...dto, companyId });
    return this.categoryRepo.save(category);
  }

  async createPart(companyId: string, dto: CreatePartDto): Promise<Part> {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId, companyId }
    });

    if (!category) {
      throw new NotFoundException('Category not found or does not belong to your company');
    }

    const part = this.partRepo.create({ ...dto, companyId });
    return this.partRepo.save(part);
  }

  async getCatalog(companyId: string): Promise<Category[]> {
    return this.categoryRepo.find({ where: { companyId } });
  }
}
