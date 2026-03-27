import { z } from "zod";

export const paginationInputSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(100).default(20),
});

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
	return z.object({
		items: z.array(itemSchema),
		total: z.number().int(),
		page: z.number().int(),
		pageSize: z.number().int(),
	});
}
