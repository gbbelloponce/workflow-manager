import { z } from "zod";
import {
	paginatedSchema,
	paginationInputSchema,
} from "../../shared/trpc/pagination.schemas";

export const resolveEventSchema = z.object({
	id: z.string().min(1),
	resolvedComment: z.string().optional(),
});

export const eventSchema = z.object({
	id: z.string(),
	status: z.enum(["OPEN", "RESOLVED"]),
	actualValue: z.number(),
	resolvedAt: z.date().nullable(),
	resolvedComment: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	workflow: z.object({
		id: z.string(),
		name: z.string(),
		triggerType: z.enum(["THRESHOLD", "VARIANCE"]),
	}),
});

export const getAllEventsInputSchema = paginationInputSchema.extend({
	workflowId: z.string().optional(),
	status: z.enum(["OPEN", "RESOLVED"]).optional(),
});

export const paginatedEventsSchema = paginatedSchema(eventSchema);

export type GetAllEventsInput = z.infer<typeof getAllEventsInputSchema>;
