import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../shared/db/prisma.service";

@Injectable()
export class EventsService {
	constructor(private readonly prisma: PrismaService) {}

	findAll() {
		return this.prisma.event.findMany({
			include: {
				workflow: {
					select: { id: true, name: true, triggerType: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}
}
