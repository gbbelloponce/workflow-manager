import { Injectable } from "@nestjs/common";
import { Input, Mutation, Query, Router } from "nestjs-trpc";
import { z } from "zod";
import type {
	CreateWorkflowInput,
	GetAllWorkflowsInput,
	UpdateWorkflowInput,
} from "./workflows.schemas";
import {
	createWorkflowSchema,
	getAllWorkflowsInputSchema,
	paginatedWorkflowsSchema,
	updateWorkflowSchema,
	workflowDetailSchema,
	workflowNameSchema,
} from "./workflows.schemas";
import { WorkflowsService } from "./workflows.service";

@Injectable()
@Router()
export class WorkflowsRouter {
	constructor(private readonly workflowsService: WorkflowsService) {}

	@Query({
		input: getAllWorkflowsInputSchema,
		output: paginatedWorkflowsSchema,
	})
	getAll(@Input() input: GetAllWorkflowsInput) {
		return this.workflowsService.findAll(input);
	}

	@Query({ output: z.array(workflowNameSchema) })
	listNames() {
		return this.workflowsService.findNames();
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
	create(@Input() input: CreateWorkflowInput) {
		return this.workflowsService.create(input);
	}

	@Mutation({
		input: updateWorkflowSchema,
		output: workflowDetailSchema,
	})
	update(@Input() input: UpdateWorkflowInput) {
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
