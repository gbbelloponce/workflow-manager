import { Injectable } from "@nestjs/common";
import { Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { WorkflowsService } from "./workflows.service";

const workflowSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdAt: z.date(),
});

@Injectable()
@Router()
export class WorkflowsRouter {
	constructor(private readonly workflowsService: WorkflowsService) {}

	@Query({ output: z.array(workflowSchema) })
	getAll() {
		return this.workflowsService.findAll();
	}
}
