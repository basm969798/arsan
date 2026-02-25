import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  items: any[];

  @IsOptional()
  @IsString()
  notes?: string;
}
