import { IPartRepository } from '../../domain/repositories/part.repository.interface';
import { PricingService } from '../../domain/services/pricing.service';

export class CreatePartHandler {
  constructor(
    private readonly partRepo: IPartRepository,
    private readonly pricingService: PricingService
  ) {}

  async handle(data: { name: string; sku: string; basePrice: number }) {
    const finalPrice = this.pricingService.calculateFinalPrice(data.basePrice);
    return await this.partRepo.save({
      ...data,
      vatRate: 15,
      // السعر النهائي سيتم تخزينه أو استخدامه لاحقاً في الفواتير
      isActive: true
    });
  }
}
