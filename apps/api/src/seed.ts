import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./shared/db/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	await prisma.$transaction(async (tx) => {
		await tx.workflow.deleteMany();

		const cpuAlert = await tx.workflow.create({
			data: {
				name: "CPU Usage Alert",
				triggerType: "THRESHOLD",
				message: "{{metric}} exceeded {{value}}%",
				isActive: true,
				thresholdConfig: {
					create: { metricName: "cpu_usage", operator: "GT", value: 80 },
				},
				recipients: {
					createMany: {
						data: [
							{ channel: "EMAIL", target: "ops@example.com" },
							{ channel: "IN_APP", target: "user_ops_1" },
						],
					},
				},
			},
		});

		const memoryAlert = await tx.workflow.create({
			data: {
				name: "Memory Pressure",
				triggerType: "THRESHOLD",
				message: "{{metric}} is at {{value}}% — investigate immediately",
				isActive: true,
				thresholdConfig: {
					create: { metricName: "memory_usage", operator: "GTE", value: 90 },
				},
				recipients: {
					createMany: {
						data: [{ channel: "EMAIL", target: "infra@example.com" }],
					},
				},
			},
		});

		await tx.workflow.create({
			data: {
				name: "Revenue Variance",
				triggerType: "VARIANCE",
				message: "Revenue deviated from baseline by {{value}}%",
				isActive: true,
				varianceConfig: {
					create: { baseValue: 10000, deviationPercent: 15 },
				},
				recipients: {
					createMany: {
						data: [
							{ channel: "EMAIL", target: "finance@example.com" },
							{ channel: "IN_APP", target: "user_finance_1" },
						],
					},
				},
			},
		});

		await tx.workflow.create({
			data: {
				name: "Disk Space Monitor",
				triggerType: "THRESHOLD",
				message: "{{metric}} is critically low at {{value}}%",
				isActive: false,
				thresholdConfig: {
					create: { metricName: "disk_free", operator: "LTE", value: 20 },
				},
				recipients: {
					createMany: {
						data: [{ channel: "IN_APP", target: "user_ops_1" }],
					},
				},
			},
		});

		// CPU events — 9 resolved + 1 open = 10 total, 2 notifications each = 20 notifications
		const cpuValues = [83.1, 85.4, 88.0, 91.2, 86.7, 84.3, 90.5, 87.8, 93.1];
		for (let i = 0; i < cpuValues.length; i++) {
			const val = cpuValues[i];
			const triggeredAt = new Date(
				`2026-01-${String(i + 1).padStart(2, "0")}T08:00:00Z`,
			);
			const resolvedAt = new Date(triggeredAt.getTime() + 2 * 60 * 60 * 1000);
			const cpuEvt = await tx.event.create({
				data: {
					workflowId: cpuAlert.id,
					actualValue: val,
					status: "RESOLVED",
					resolvedAt,
					resolvedComment: "Spike resolved after auto-scaling kicked in",
					createdAt: triggeredAt,
				},
			});
			await tx.notification.createMany({
				data: [
					{
						eventId: cpuEvt.id,
						channel: "EMAIL",
						target: "ops@example.com",
						message: `cpu_usage exceeded ${val}%`,
						status: "DELIVERED",
						createdAt: triggeredAt,
					},
					{
						eventId: cpuEvt.id,
						channel: "IN_APP",
						target: "user_ops_1",
						message: `cpu_usage exceeded ${val}%`,
						status: "DELIVERED",
						createdAt: triggeredAt,
					},
				],
			});
		}

		const cpuEvent = await tx.event.create({
			data: {
				workflowId: cpuAlert.id,
				actualValue: 92.5,
				status: "OPEN",
			},
		});

		await tx.notification.createMany({
			data: [
				{
					eventId: cpuEvent.id,
					channel: "EMAIL",
					target: "ops@example.com",
					message: "cpu_usage exceeded 92.5%",
					status: "QUEUED",
				},
				{
					eventId: cpuEvent.id,
					channel: "IN_APP",
					target: "user_ops_1",
					message: "cpu_usage exceeded 92.5%",
					status: "QUEUED",
				},
			],
		});

		// Memory events — 4 resolved + 1 open = 5 total, 1 notification each = 5 notifications
		const memoryValues = [90.3, 92.0, 91.5, 93.8];
		for (let i = 0; i < memoryValues.length; i++) {
			const val = memoryValues[i];
			const triggeredAt = new Date(
				`2026-02-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
			);
			const resolvedAt = new Date(triggeredAt.getTime() + 3 * 60 * 60 * 1000);
			const memEvt = await tx.event.create({
				data: {
					workflowId: memoryAlert.id,
					actualValue: val,
					status: "RESOLVED",
					resolvedAt,
					resolvedComment:
						"Restarted application servers, memory returned to normal",
					createdAt: triggeredAt,
				},
			});
			await tx.notification.create({
				data: {
					eventId: memEvt.id,
					channel: "EMAIL",
					target: "infra@example.com",
					message: `memory_usage is at ${val}% — investigate immediately`,
					status: "DELIVERED",
					createdAt: triggeredAt,
				},
			});
		}

		const memoryEvent = await tx.event.create({
			data: {
				workflowId: memoryAlert.id,
				actualValue: 95.1,
				status: "RESOLVED",
				resolvedAt: new Date("2026-03-20T14:30:00Z"),
				resolvedComment:
					"Restarted application servers, memory returned to normal",
			},
		});

		await tx.notification.create({
			data: {
				eventId: memoryEvent.id,
				channel: "EMAIL",
				target: "infra@example.com",
				message: "memory_usage is at 95.1% — investigate immediately",
				status: "QUEUED",
			},
		});
	});

	console.log("Seed complete.");
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
