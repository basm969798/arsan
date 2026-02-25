import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Part } from '../../../catalog/domain/entities/part.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  async searchParts(query: string): Promise<Part[]> {
    console.log(`[SearchService] Executing advanced search for: ${query}`);

    return this.partRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { oemNumber: Like(`%${query}%`) }
      ],
      relations: ['category']
    });
  }

  async indexPart(partData: any): Promise<void> {
    console.log(`[SearchService] Indexing update received for: ${partData.id}`);
  }
}
