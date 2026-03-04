import { Controller, Post, Body, Param, Headers, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { OfferService } from './offer.service';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  // 🚚 مورد يقوم بتقديم عرض سعر
  @Post()
  async submitOffer(
    @Headers('x-company-id') companyId: string,
    @Headers('x-actor-id') actorId: string, 
    @Body() body: { orderId: string; price: number },
  ) {
    // 1. التحقق من وجود الهيدرز (لأنها إجبارية حسب الـ Invariants)
    if (!companyId || !actorId) {
      throw new BadRequestException('Identification headers (x-company-id, x-actor-id) are required');
    }

    // 2. استدعاء الخدمة (الترتيب: معرف الطلب، معرف المورد، معرف الشركة، معرف المنفذ، السعر)
    // نعتبر الـ actorId هو نفسه الـ supplierId في هذه المرحلة
    return await this.offerService.submitOffer(
      body.orderId, 
      actorId, 
      companyId, 
      actorId, 
      body.price
    );
  }

  // ✅ عميل يقبل عرض سعر محدد
  @Post(':id/accept')
  async acceptOffer(
    @Param('id', new ParseUUIDPipe()) offerId: string, // التحقق من UUID العرض
    @Headers('x-company-id') companyId: string,
    @Headers('x-actor-id') actorId: string,
    @Body('orderId') orderId: string,
  ) {
    if (!orderId) {
      throw new BadRequestException('orderId is required in the body');
    }

    // قبول العرض وقفل السعر في الطلب
    return await this.offerService.acceptOffer(
      offerId, 
      orderId, 
      companyId, 
      actorId
    );
  }
}