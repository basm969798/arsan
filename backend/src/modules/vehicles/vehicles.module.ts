import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './domain/entities/vehicle.entity';
import { VehiclesController } from './api/controllers/vehicles.controller';
import { VehiclesService } from './application/services/vehicles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [TypeOrmModule, VehiclesService],
})
export class VehiclesModule {}
