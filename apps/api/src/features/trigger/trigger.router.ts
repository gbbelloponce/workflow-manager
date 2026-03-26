import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { Input, Mutation, Router } from "nestjs-trpc";
import { z } from "zod";
import { TriggerService } from "./trigger.service";

const evaluateResultSchema = z.discriminatedUnion("triggered", [
	z.object({ triggered: z.literal(true), eventId: z.string() }),
	z.object({ triggered: z.literal(false) }),
]);

@Injectable()
@Router()
export class TriggerRouter {
	constructor(private readonly triggerService: TriggerService) {}

	@Mutation({
		input: z.object({ workflowId: z.string(), actualValue: z.number() }),
		output: evaluateResultSchema,
	})
	async trigger(@Input() input: { workflowId: string; actualValue: number }) {
		try {
			return await this.triggerService.evaluate(
				input.workflowId,
				input.actualValue,
			);
		} catch (err) {
			if (err instanceof TRPCError) {
				throw new TRPCError({ code: err.code, message: err.message });
			}
			throw err;
		}
	}
}
