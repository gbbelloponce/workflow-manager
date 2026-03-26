import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TriggerModule } from "./features/trigger/trigger.module";
import { WorkflowsModule } from "./features/workflows/workflows.module";
import { PrismaModule } from "./shared/db/prisma.module";
import { AppRouter } from "./shared/trpc/app.router";

@Module({
	imports: [TRPCModule.forRoot(), PrismaModule, WorkflowsModule, TriggerModule],
	controllers: [AppController],
	providers: [AppService, AppRouter],
})
export class AppModule {}
