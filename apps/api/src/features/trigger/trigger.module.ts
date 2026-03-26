import { Module } from "@nestjs/common";
import { WorkflowsModule } from "../workflows/workflows.module";
import { TriggerRouter } from "./trigger.router";
import { TriggerService } from "./trigger.service";

@Module({
	imports: [WorkflowsModule],
	providers: [TriggerService, TriggerRouter],
})
export class TriggerModule {}
