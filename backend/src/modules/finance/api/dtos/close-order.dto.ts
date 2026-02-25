import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ClosingType {
  CASH = 'CASH',
  DEBT = 'DEBT'
}

export class CloseOrderDto {
  @IsUUID()
  orderId: string;

  @IsEnum(ClosingType)
  type: ClosingType;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}
