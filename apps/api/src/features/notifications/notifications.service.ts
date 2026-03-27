import { Injectable } from "@nestjs/common";
import type { NotificationChannel } from "../../shared/db/generated/prisma/client";
import { PrismaService } from "../../shared/db/prisma.service";

interface WorkflowForNotification {
	message: string;
	triggerType: "THRESHOLD" | "VARIANCE";
	thresholdConfig: { metricName: string } | null;
	recipients: Array<{ channel: NotificationChannel; target: string }>;
}

@Injectable()
export class NotificationsService {
	constructor(private readonly prisma: PrismaService) {}

	async notifyForEvent(
		eventId: string,
		workflow: WorkflowForNotification,
		actualValue: number,
	): Promise<void> {
		const metric =
			workflow.triggerType === "THRESHOLD"
				? (workflow.thresholdConfig?.metricName ?? "metric")
				: "value";

		const message = this.interpolateMessage(
			workflow.message,
			metric,
			actualValue,
		);

		await this.prisma.notification.createMany({
			data: workflow.recipients.map((r) => ({
				eventId,
				channel: r.channel,
				target: r.target,
				message,
			})),
		});
	}

	private interpolateMessage(
		template: string,
		metric: string,
		value: number,
	): string {
		return template
			.replaceAll("{{metric}}", metric)
			.replaceAll("{{value}}", String(value));
	}
}
