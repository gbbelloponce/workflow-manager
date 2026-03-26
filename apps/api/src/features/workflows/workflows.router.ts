import { Injectable } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { z } from "zod";
import {
	createWorkflowSchema,
	updateWorkflowSchema,
	workflowDetailSchema,
	workflowSummarySchema,
} from "./workflows.schemas";
import { WorkflowsService } from "./workflows.service";

@Injectable()
@Router()
export class WorkflowsRouter {
	constructor(private readonly workflowsService: WorkflowsService) {}

	@Query({ output: z.array(workflowSummarySchema) })
	getAll() {
		return this.workflowsService.findAll();
	}

	@Query({
		input: z.object({ id: z.string() }),
		output: workflowDetailSchema,
	})
	getById(@Input() input: { id: string }) {
		return this.workflowsService.findById(input.id);
	}

	@Mutation({
		input: createWorkflowSchema,
		output: workflowDetailSchema,
	})
	create(@Input() input: z.infer<typeof createWorkflowSchema>) {
		return this.workflowsService.create(input);
	}

	@Mutation({
		input: updateWorkflowSchema,
		output: workflowDetailSchema,
	})
	update(@Input() input: z.infer<typeof updateWorkflowSchema>) {
		return this.workflowsService.update(input);
	}

	@Mutation({
		input: z.object({ id: z.string() }),
		output: z.object({ id: z.string() }),
	})
	delete(@Input() input: { id: string }) {
		return this.workflowsService.delete(input.id);
	}
}
