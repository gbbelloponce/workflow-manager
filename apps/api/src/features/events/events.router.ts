import { Injectable } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import type { GetAllEventsInput, ResolveEventInput } from "./events.schemas";
import {
	eventSchema,
	getAllEventsInputSchema,
	paginatedEventsSchema,
	resolveEventSchema,
} from "./events.schemas";
import { EventsService } from "./events.service";

@Injectable()
@Router()
export class EventsRouter {
	constructor(private readonly eventsService: EventsService) {}

	@Query({ input: getAllEventsInputSchema, output: paginatedEventsSchema })
	getAll(@Input() input: GetAllEventsInput) {
		return this.eventsService.findAll(input);
	}

	@Mutation({
		input: resolveEventSchema,
		output: eventSchema,
	})
	resolve(@Input() input: ResolveEventInput) {
		return this.eventsService.resolve(input.id, input.resolvedComment);
	}
}
