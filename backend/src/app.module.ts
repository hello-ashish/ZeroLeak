import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { EventsGateway } from './events/events.gateway';
import { AgentsService } from './agents/agents.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DatabaseService, EventsGateway, AgentsService],
})
export class AppModule {}
