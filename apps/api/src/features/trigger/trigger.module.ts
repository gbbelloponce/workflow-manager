import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { WorkflowsModule } from "../workflows/workflows.module";
import { TriggerRouter } from "./trigger.router";
import { TriggerService } from "./trigger.service";

@Module({
	imports: [WorkflowsModule, NotificationsModule],
	providers: [TriggerService, TriggerRouter],
})
export class TriggerModule {}
