import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreatePartHandler } from '../../application/handlers/create-part.handler';

@Controller('catalog/parts')
export class CatalogController {
  constructor(private readonly createPartHandler: CreatePartHandler) {}

  @Post()
  async create(@Body() body: { name: string; sku: string; basePrice: number }) {
    return await this.createPartHandler.handle(body);
  }
}
