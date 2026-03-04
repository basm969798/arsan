import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { OrderService } from './order.service';
import { PickupService } from './pickup.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly pickupService: PickupService,
  ) {}

  // 1. إنشاء طلب
  @Post()
  async create(
    @Body() dto: any, 
    @Headers('x-company-id') headerCompanyId: string, 
    @Headers('x-actor-id') headerActorId: string
  ) {
    // نستخدم الهيدر، وإذا كان فارغاً نستخدم UUID افتراضي صالح (وليس نصاً عادياً)
    const companyId = headerCompanyId || '550e8400-e29b-41d4-a716-446655440000';
    const actorId = headerActorId || '550e8400-e29b-41d4-a716-446655440000';
    return this.orderService.createOrder(dto, companyId, actorId);
  }

  // 2. إلغاء الطلب
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string, 
    @Body('reason') reason: string, 
    @Headers('x-company-id') companyId: string, 
    @Headers('x-actor-id') actorId: string
  ) {
    return this.orderService.cancelOrder(id, companyId, actorId, reason);
  }

  // 3. توليد رمز QR للاستلام
  @Get(':id/pickup-qr')
  async getPickupQR(
    @Param('id') id: string, 
    @Headers('x-company-id') companyId: string, 
    @Headers('x-actor-id') actorId: string
  ) {
    const qrCode = await this.pickupService.generatePickupCode(id, companyId, actorId);
    return { qrCode };
  }

  // 4. تنفيذ الاستلام بمسح الـ QR
  @Post('process-pickup')
  async processPickup(
    @Body('qrCode') qrCode: string, 
    @Headers('x-actor-id') actorId: string
  ) {
    return this.pickupService.processPickup(qrCode, actorId);
  }

  // 5. دفع مالي للطلب
  @Post(':id/pay')
  async pay(
    @Param('id') id: string, 
    @Body('amount') amount: number, 
    @Headers('x-company-id') companyId: string, 
    @Headers('x-actor-id') actorId: string
  ) {
    await this.orderService.payOrder(id, companyId, actorId, amount);
    return { success: true, message: 'Payment recorded' };
  }

  // 6. إكمال الطلب (بعد التأكد من الرصيد صفر)
  @Post(':id/complete')
  async complete(
    @Param('id') id: string, 
    @Headers('x-company-id') companyId: string, 
    @Headers('x-actor-id') actorId: string
  ) {
    return this.orderService.completeOrder(id, companyId, actorId);
  }
}