import { IsNumber, IsPositive, IsUUID } from 'class-validator';
export class SubmitOfferDto {
  @IsUUID() orderId: string;
  @IsUUID() supplierId: string;
  @IsNumber() @IsPositive() price: number;
}
export class AcceptOfferDto {
  @IsUUID() orderId: string;
}
