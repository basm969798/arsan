import { Controller, Post, Get, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from '../../application/services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { PickupOrderDto } from '../dtos/pickup-order.dto';
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

  @Patch(':id/pickup')
  async pickup(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: PickupOrderDto) {
    return this.ordersService.confirmPickup(user.companyId, id, dto.verificationCode);
  }
}
