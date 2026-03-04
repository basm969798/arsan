import { Controller, Post, Body, Param, Request } from '@nestjs/common';
import { OfferService } from './offer.service';
import { SubmitOfferDto, AcceptOfferDto } from './offer.dto';

@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}
  @Post('submit')
  async submitOffer(@Body() dto: SubmitOfferDto, @Request() req: any) {
    const companyId = req.user?.companyId || 'company-A'; 
    const actorId = req.user?.id || 'supplier-1';
    return this.offerService.submitOffer(dto.orderId, dto.supplierId, companyId, actorId, dto.price);
  }
  @Post(':offerId/accept')
  async acceptOffer(@Param('offerId') offerId: string, @Body() dto: AcceptOfferDto, @Request() req: any) {
    const companyId = req.user?.companyId || 'company-A';
    const actorId = req.user?.id || 'customer-1';
    return this.offerService.acceptOffer(offerId, dto.orderId, companyId, actorId);
  }
}
