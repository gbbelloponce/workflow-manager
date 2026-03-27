import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { EventsModule } from "./features/events/events.module";
import { NotificationsModule } from "./features/notifications/notifications.module";
import { TriggerModule } from "./features/trigger/trigger.module";
import { WorkflowsModule } from "./features/workflows/workflows.module";
import { PrismaModule } from "./shared/db/prisma.module";

@Module({
	imports: [
		TRPCModule.forRoot(),
		PrismaModule,
		WorkflowsModule,
		TriggerModule,
		EventsModule,
		NotificationsModule,
	],
})
export class AppModule {}
