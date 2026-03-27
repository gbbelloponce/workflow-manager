import { z } from "zod";
import {
	paginatedSchema,
	paginationInputSchema,
} from "../../shared/trpc/pagination.schemas";

export const notificationSchema = z.object({
	id: z.string(),
	channel: z.enum(["IN_APP", "EMAIL"]),
	target: z.string(),
	message: z.string(),
	status: z.enum(["QUEUED", "DELIVERED"]),
	createdAt: z.date(),
	deliveredAt: z.date().nullable(),
	event: z.object({
		id: z.string(),
		workflow: z.object({
			id: z.string(),
			name: z.string(),
		}),
	}),
});

export const paginatedNotificationsSchema = paginatedSchema(notificationSchema);

export type GetAllNotificationsInput = z.infer<typeof paginationInputSchema>;
