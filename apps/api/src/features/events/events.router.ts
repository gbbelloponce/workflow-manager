import { Injectable } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { eventSchema, resolveEventSchema } from "./events.schemas";
import { EventsService } from "./events.service";

@Injectable()
@Router()
export class EventsRouter {
	constructor(private readonly eventsService: EventsService) {}

	@Query({ output: z.array(eventSchema) })
	getAll() {
		return this.eventsService.findAll();
	}

	@Mutation({
		input: resolveEventSchema,
		output: eventSchema,
	})
	resolve(@Input() input: { id: string; resolvedComment?: string }) {
		return this.eventsService.resolve(input.id, input.resolvedComment);
	}
}
