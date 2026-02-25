import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from '../../application/services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.companyId, user.userId, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.ordersService.getMyOrders(user.companyId);
  }
}
