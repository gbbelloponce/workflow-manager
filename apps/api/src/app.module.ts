import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import { PrismaModule } from "./shared/db/prisma.module";
import { AppRouter } from "./shared/trpc/app.router";

@Module({
	imports: [TRPCModule.forRoot(), PrismaModule, WorkflowsModule],
	controllers: [AppController],
	providers: [AppService, AppRouter],
})
export class AppModule {}
