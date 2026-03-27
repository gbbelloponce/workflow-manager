import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { Prisma } from "../../shared/db/generated/prisma/client";
import { PrismaService } from "../../shared/db/prisma.service";
import type {
	CreateWorkflowInput,
	GetAllWorkflowsInput,
	UpdateWorkflowInput,
} from "./workflows.schemas";

@Injectable()
export class WorkflowsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(input: GetAllWorkflowsInput) {
		const { page, pageSize } = input;
		const [items, total] = await this.prisma.$transaction([
			this.prisma.workflow.findMany({
				select: {
					id: true,
					name: true,
					triggerType: true,
					isActive: true,
					createdAt: true,
					_count: { select: { recipients: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			this.prisma.workflow.count(),
		]);
		return { items, total, page, pageSize };
	}

	async findById(id: string) {
		const workflow = await this.prisma.workflow.findUnique({
			where: { id },
			include: {
				thresholdConfig: true,
				varianceConfig: true,
				recipients: true,
			},
		});

		if (!workflow) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Workflow not found.",
			});
		}

		return workflow;
	}

	async create(data: CreateWorkflowInput) {
		if (data.triggerType === "THRESHOLD") {
			if (!data.thresholdConfig) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "thresholdConfig is required for THRESHOLD workflows.",
				});
			}
			if (data.varianceConfig) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"varianceConfig must not be provided for THRESHOLD workflows.",
				});
			}
		}

		if (data.triggerType === "VARIANCE") {
			if (!data.varianceConfig) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "varianceConfig is required for VARIANCE workflows.",
				});
			}
			if (data.thresholdConfig) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message:
						"thresholdConfig must not be provided for VARIANCE workflows.",
				});
			}
		}

		return this.prisma.$transaction(async (tx) => {
			const workflow = await tx.workflow.create({
				data: {
					name: data.name,
					triggerType: data.triggerType,
					message: data.message,
					isActive: true,
				},
			});

			if (data.triggerType === "THRESHOLD" && data.thresholdConfig) {
				await tx.thresholdConfig.create({
					data: {
						workflowId: workflow.id,
						metricName: data.thresholdConfig.metricName,
						operator: data.thresholdConfig.operator,
						value: data.thresholdConfig.value,
					},
				});
			}

			if (data.triggerType === "VARIANCE" && data.varianceConfig) {
				await tx.varianceConfig.create({
					data: {
						workflowId: workflow.id,
						baseValue: data.varianceConfig.baseValue,
						deviationPercent: data.varianceConfig.deviationPercent,
					},
				});
			}

			await tx.recipient.createMany({
				data: data.recipients.map((r) => ({
					workflowId: workflow.id,
					channel: r.channel,
					target: r.target,
				})),
			});

			return tx.workflow.findUniqueOrThrow({
				where: { id: workflow.id },
				include: {
					thresholdConfig: true,
					varianceConfig: true,
					recipients: true,
				},
			});
		});
	}

	async update(data: UpdateWorkflowInput) {
		try {
			return await this.prisma.$transaction(async (tx) => {
				const workflow = await tx.workflow.findUnique({
					where: { id: data.id },
					select: { id: true, triggerType: true },
				});

				if (!workflow) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Workflow not found.",
					});
				}

				// Trigger type and config type are immutable — reject mismatched config updates
				if (data.thresholdConfig && workflow.triggerType !== "THRESHOLD") {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Cannot update thresholdConfig on a VARIANCE workflow.",
					});
				}
				if (data.varianceConfig && workflow.triggerType !== "VARIANCE") {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Cannot update varianceConfig on a THRESHOLD workflow.",
					});
				}

				await tx.workflow.update({
					where: { id: data.id },
					data: {
						...(data.name !== undefined && { name: data.name }),
						...(data.message !== undefined && { message: data.message }),
						...(data.isActive !== undefined && { isActive: data.isActive }),
					},
				});

				if (data.thresholdConfig) {
					await tx.thresholdConfig.update({
						where: { workflowId: workflow.id },
						data: {
							metricName: data.thresholdConfig.metricName,
							operator: data.thresholdConfig.operator,
							value: data.thresholdConfig.value,
						},
					});
				}

				if (data.varianceConfig) {
					await tx.varianceConfig.update({
						where: { workflowId: workflow.id },
						data: {
							baseValue: data.varianceConfig.baseValue,
							deviationPercent: data.varianceConfig.deviationPercent,
						},
					});
				}

				return tx.workflow.findUniqueOrThrow({
					where: { id: workflow.id },
					include: {
						thresholdConfig: true,
						varianceConfig: true,
						recipients: true,
					},
				});
			});
		} catch (err) {
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2025"
			) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found.",
				});
			}
			throw err;
		}
	}

	async delete(id: string) {
		try {
			await this.prisma.workflow.delete({ where: { id } });
			return { id };
		} catch (err) {
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === "P2025"
			) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found.",
				});
			}
			throw err;
		}
	}
}
