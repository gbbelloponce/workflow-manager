import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/db/prisma.service";

@Injectable()
export class WorkflowsService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.workflow.findMany();
	}
}
