import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { PrismaService } from "../../shared/db/prisma.service";
import type { GetAllEventsInput } from "./events.schemas";

@Injectable()
export class EventsService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll(input: GetAllEventsInput) {
		const { page, pageSize } = input;
		const [items, total] = await this.prisma.$transaction([
			this.prisma.event.findMany({
				include: {
					workflow: { select: { id: true, name: true, triggerType: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			this.prisma.event.count(),
		]);
		return { items, total, page, pageSize };
	}

	async resolve(id: string, resolvedComment?: string) {
		const event = await this.prisma.event.findUnique({ where: { id } });

		if (!event) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
		}

		if (event.status === "RESOLVED") {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Event is already resolved.",
			});
		}

		return this.prisma.event.update({
			where: { id },
			data: {
				status: "RESOLVED",
				resolvedAt: new Date(),
				...(resolvedComment !== undefined && { resolvedComment }),
			},
			include: {
				workflow: {
					select: { id: true, name: true, triggerType: true },
				},
			},
		});
	}
}
