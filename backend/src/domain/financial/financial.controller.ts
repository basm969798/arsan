import { Controller, Post, Get, Body, Param, Headers, Request } from '@nestjs/common';
import { FinancialService } from './financial.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post('payment')
  async registerPayment(
    @Body() body: { orderId: string; amount: number },
    @Request() req: any,
    @Headers('x-idempotency-key') idempotencyKey: string
  ) {
    const companyId = req.user?.companyId || 'company-A'; // سيتم أخذها من الـ Token لاحقاً
    const actorId = req.user?.id || 'user-1';

    // إذا لم يرسل العميل مفتاح Idempotency، ننشئ واحداً مؤقتاً (لأغراض الاختبار)
    const key = idempotencyKey || `pay-${body.orderId}-${Date.now()}`;

    return await this.financialService.registerPayment(
      body.orderId, 
      companyId, 
      actorId, 
      body.amount, 
      key
    );
  }

  @Get('balance/:orderId')
  async getBalance(
    @Param('orderId') orderId: string,
    @Request() req: any
  ) {
    const companyId = req.user?.companyId || 'company-A';
    const balance = await this.financialService.getOrderBalance(orderId, companyId);
    return { orderId, balance };
  }
}