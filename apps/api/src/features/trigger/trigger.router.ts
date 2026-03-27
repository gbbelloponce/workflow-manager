import { Injectable } from "@nestjs/common";
import { Input, Mutation, Router } from "nestjs-trpc";
import type { TriggerInput } from "./trigger.schemas";
import { evaluateResultSchema, triggerInputSchema } from "./trigger.schemas";
import { TriggerService } from "./trigger.service";

@Injectable()
@Router()
export class TriggerRouter {
	constructor(private readonly triggerService: TriggerService) {}

	@Mutation({
		input: triggerInputSchema,
		output: evaluateResultSchema,
	})
	trigger(@Input() input: TriggerInput) {
		return this.triggerService.evaluate(input.workflowId, input.actualValue);
	}
}
