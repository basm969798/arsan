import { IsString, IsNotEmpty } from 'class-validator';

export class PickupOrderDto {
  @IsString()
  @IsNotEmpty()
  verificationCode: string;
}
