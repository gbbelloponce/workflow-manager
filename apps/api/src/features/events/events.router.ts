import { Injectable } from "@nestjs/common";
import { Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { eventSchema } from "./events.schemas";
import { EventsService } from "./events.service";

@Injectable()
@Router()
export class EventsRouter {
	constructor(private readonly eventsService: EventsService) {}

	@Query({ output: z.array(eventSchema) })
	getAll() {
		return this.eventsService.findAll();
	}
}
