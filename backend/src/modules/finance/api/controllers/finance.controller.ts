import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FinanceService } from '../../application/services/finance.service';
import { CloseOrderDto } from '../dtos/close-order.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('close-order')
  async close(@CurrentUser() user: any, @Body() dto: CloseOrderDto) {
    return this.financeService.closeOrder(user.companyId, dto);
  }
}
