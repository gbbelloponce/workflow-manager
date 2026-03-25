import { Module } from "@nestjs/common";
import { TRPCModule } from "nestjs-trpc";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppRouter } from "./shared/trpc/app.router";

@Module({
	imports: [TRPCModule.forRoot()],
	controllers: [AppController],
	providers: [AppService, AppRouter],
})
export class AppModule {}
