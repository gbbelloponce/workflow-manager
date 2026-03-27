import { z } from "zod";
import {
	paginatedSchema,
	paginationInputSchema,
} from "../../shared/trpc/pagination.schemas";

export const recipientSchema = z.object({
	id: z.string(),
	channel: z.enum(["IN_APP", "EMAIL"]),
	target: z.string(),
	workflowId: z.string(),
});

export const workflowDetailSchema = z.object({
	id: z.string(),
	name: z.string(),
	triggerType: z.enum(["THRESHOLD", "VARIANCE"]),
	message: z.string(),
	isActive: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
	thresholdConfig: z
		.object({
			id: z.string(),
			metricName: z.string(),
			operator: z.enum(["GT", "LT", "GTE", "LTE", "EQ"]),
			value: z.number(),
			workflowId: z.string(),
		})
		.nullable(),
	varianceConfig: z
		.object({
			id: z.string(),
			baseValue: z.number(),
			deviationPercent: z.number(),
			workflowId: z.string(),
		})
		.nullable(),
	recipients: z.array(recipientSchema),
});

export const workflowSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	triggerType: z.enum(["THRESHOLD", "VARIANCE"]),
	isActive: z.boolean(),
	createdAt: z.date(),
	_count: z.object({ recipients: z.number() }),
});

export const createWorkflowSchema = z.object({
	name: z.string().min(1),
	triggerType: z.enum(["THRESHOLD", "VARIANCE"]),
	message: z.string().min(1),
	thresholdConfig: z
		.object({
			metricName: z.string().min(1),
			operator: z.enum(["GT", "LT", "GTE", "LTE", "EQ"]),
			value: z.number(),
		})
		.optional(),
	varianceConfig: z
		.object({
			baseValue: z.number(),
			deviationPercent: z.number().min(0).max(100),
		})
		.optional(),
	recipients: z
		.array(
			z.object({
				channel: z.enum(["IN_APP", "EMAIL"]),
				target: z.string().min(1),
			}),
		)
		.min(1),
});

export const updateWorkflowSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1).optional(),
	message: z.string().min(1).optional(),
	isActive: z.boolean().optional(),
	thresholdConfig: z
		.object({
			metricName: z.string().min(1),
			operator: z.enum(["GT", "LT", "GTE", "LTE", "EQ"]),
			value: z.number(),
		})
		.optional(),
	varianceConfig: z
		.object({
			baseValue: z.number(),
			deviationPercent: z.number().min(0).max(100),
		})
		.optional(),
});

export const getAllWorkflowsInputSchema = paginationInputSchema.extend({
	name: z.string().optional(),
	isActive: z.boolean().optional(),
});

export const workflowNameSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const paginatedWorkflowsSchema = paginatedSchema(workflowSummarySchema);

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type GetAllWorkflowsInput = z.infer<typeof getAllWorkflowsInputSchema>;
