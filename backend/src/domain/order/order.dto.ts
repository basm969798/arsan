// backend/src/domain/order/order.dto.ts
import { IsUUID, IsNotEmpty, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsArray()
  @IsOptional()
  items?: any[];

  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string; // 👈 أضفنا هذا الحقل ليتمكن السيرفر من قبوله
}