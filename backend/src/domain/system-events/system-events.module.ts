import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemEvent } from './system-event.entity';
import { EventStoreService } from './event-store.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemEvent])],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class SystemEventsModule {}