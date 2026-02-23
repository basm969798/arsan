import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CompaniesModule,
    CatalogModule,
    VehiclesModule,
    OrdersModule,
    NotificationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
