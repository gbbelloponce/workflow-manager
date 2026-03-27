import { Injectable } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { paginationInputSchema } from "../../shared/trpc/pagination.schemas";
import type { GetAllEventsInput } from "./events.schemas";
import {
	eventSchema,
	paginatedEventsSchema,
	resolveEventSchema,
} from "./events.schemas";
import { EventsService } from "./events.service";

@Injectable()
@Router()
export class EventsRouter {
	constructor(private readonly eventsService: EventsService) {}

	@Query({ input: paginationInputSchema, output: paginatedEventsSchema })
	getAll(@Input() input: GetAllEventsInput) {
		return this.eventsService.findAll(input);
	}

	@Mutation({
		input: resolveEventSchema,
		output: eventSchema,
	})
	resolve(@Input() input: { id: string; resolvedComment?: string }) {
		return this.eventsService.resolve(input.id, input.resolvedComment);
	}
}
