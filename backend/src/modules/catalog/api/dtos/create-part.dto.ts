import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsString()
  oemNumber: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;
}
