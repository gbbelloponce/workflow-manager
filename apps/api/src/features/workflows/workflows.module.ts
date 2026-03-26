import { Module } from "@nestjs/common";
import { WorkflowsRouter } from "./workflows.router";
import { WorkflowsService } from "./workflows.service";

@Module({
	providers: [WorkflowsService, WorkflowsRouter],
	exports: [WorkflowsService],
})
export class WorkflowsModule {}
