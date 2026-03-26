import { z } from "zod";

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
