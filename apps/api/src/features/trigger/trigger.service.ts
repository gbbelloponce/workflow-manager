import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type { Operator } from "../../shared/db/generated/prisma/client";
import { PrismaService } from "../../shared/db/prisma.service";
import { WorkflowsService } from "../workflows/workflows.service";

export type EvaluateResult =
	| { triggered: true; eventId: string }
	| { triggered: false };

type WorkflowDetail = Awaited<ReturnType<WorkflowsService["findById"]>>;

const OPERATORS: Record<Operator, (a: number, b: number) => boolean> = {
	GT: (a, b) => a > b,
	LT: (a, b) => a < b,
	GTE: (a, b) => a >= b,
	LTE: (a, b) => a <= b,
	EQ: (a, b) => a === b,
};

@Injectable()
export class TriggerService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly workflowsService: WorkflowsService,
	) {}

	async evaluate(
		workflowId: string,
		actualValue: number,
	): Promise<EvaluateResult> {
		const workflow = await this.workflowsService.findById(workflowId);

		if (!workflow.isActive) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Workflow is inactive.",
			});
		}

		const openEvent = await this.prisma.event.findFirst({
			where: { workflowId, status: "OPEN" },
			select: { id: true },
		});
		if (openEvent) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "This workflow already has an open event.",
			});
		}

		if (!this.conditionMet(workflow, actualValue)) {
			return { triggered: false };
		}

		const eventId = await this.createEvent(workflowId, actualValue);

		// TODO: notify recipients

		return { triggered: true, eventId };
	}

	private conditionMet(workflow: WorkflowDetail, actualValue: number): boolean {
		if (workflow.triggerType === "THRESHOLD") {
			if (!workflow.thresholdConfig) return false;
			return this.evaluateThreshold(workflow.thresholdConfig, actualValue);
		}

		if (workflow.triggerType === "VARIANCE") {
			if (!workflow.varianceConfig) return false;
			return this.evaluateVariance(workflow.varianceConfig, actualValue);
		}

		return false;
	}

	private evaluateThreshold(
		config: { operator: Operator; value: number },
		actualValue: number,
	): boolean {
		return OPERATORS[config.operator](actualValue, config.value);
	}

	private evaluateVariance(
		config: { baseValue: number; deviationPercent: number },
		actualValue: number,
	): boolean {
		if (config.baseValue === 0) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					"Variance config has a baseValue of 0 — cannot compute deviation.",
			});
		}

		const deviation =
			(Math.abs(actualValue - config.baseValue) / config.baseValue) * 100;

		return deviation > config.deviationPercent;
	}

	private async createEvent(
		workflowId: string,
		actualValue: number,
	): Promise<string> {
		try {
			const event = await this.prisma.event.create({
				data: { workflowId, actualValue, status: "OPEN" },
				select: { id: true },
			});
			return event.id;
		} catch (err) {
			if (
				err instanceof Error &&
				"code" in err &&
				(err as { code: string }).code === "P2002"
			) {
				// This may happen if two requests reach the API at the same time and both try to
				// create the event for the same workflow
				throw new TRPCError({
					code: "CONFLICT",
					message: "This workflow already has an open event.",
				});
			}
			throw err;
		}
	}
}
