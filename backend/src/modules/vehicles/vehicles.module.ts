import { Module } from '@nestjs/common';
import { VehiclesController } from './api/vehicles.controller';
import { VehiclesService } from './application/vehicles.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
