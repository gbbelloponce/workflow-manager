import { Module } from "@nestjs/common";
import { EventsRouter } from "./events.router";
import { EventsService } from "./events.service";

@Module({
	providers: [EventsService, EventsRouter],
})
export class EventsModule {}
