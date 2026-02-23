import { Get } from '@nestjs/common';

export class BaseController<T> {
  protected items: T[] = [];

  @Get()
  findAll(): T[] {
    return this.items;
  }
}
