import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreatePartDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  name: string;

  @IsString()
  oemNumber: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;
}
