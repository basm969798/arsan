import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  async indexPart(partData: any): Promise<void> {
    console.log('[SearchService] Indexing new part:', partData?.name);
  }

  async search(query: string): Promise<any[]> {
    return [];
  }
}
