import { Controller } from '@nestjs/common';
import { BaseController } from '../../../common/base.controller';

@Controller('orders')
export class OrdersController extends BaseController<any> {}
