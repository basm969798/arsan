import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  supplierId: string;

  @IsArray()
  items: any[];

  @IsOptional()
  @IsString()
  notes?: string;
}
