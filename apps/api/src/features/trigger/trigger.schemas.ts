import { z } from "zod";

export const triggerInputSchema = z.object({
	workflowId: z.string(),
	actualValue: z.number(),
});

export const evaluateResultSchema = z.discriminatedUnion("triggered", [
	z.object({ triggered: z.literal(true), eventId: z.string() }),
	z.object({ triggered: z.literal(false) }),
]);

export type TriggerInput = z.infer<typeof triggerInputSchema>;
