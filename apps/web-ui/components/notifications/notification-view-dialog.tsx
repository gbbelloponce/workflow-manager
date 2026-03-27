"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RouterOutputs } from "@/lib/trpc/types";

type Notification = RouterOutputs["notificationsRouter"]["getAll"][number];

interface NotificationViewDialogProps {
	notification: Notification | null;
	onClose: () => void;
}

export function NotificationViewDialog({
	notification,
	onClose,
}: NotificationViewDialogProps) {
	return (
		<Dialog
			open={notification !== null}
			onOpenChange={(open) => !open && onClose()}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Notification details</DialogTitle>
				</DialogHeader>

				{notification && <NotificationDetails notification={notification} />}

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function NotificationDetails({ notification }: { notification: Notification }) {
	return (
		<div className="space-y-4 text-sm">
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Workflow</span>
				<span className="font-medium">{notification.event.workflow.name}</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Channel</span>
				<Badge variant="outline">{notification.channel}</Badge>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Target</span>
				<span className="font-mono">{notification.target}</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Status</span>
				<Badge
					variant={
						notification.status === "DELIVERED" ? "default" : "secondary"
					}
				>
					{notification.status}
				</Badge>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Sent at</span>
				<span>{new Date(notification.createdAt).toLocaleString()}</span>
			</div>

			{notification.deliveredAt && (
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">Delivered at</span>
					<span>{new Date(notification.deliveredAt).toLocaleString()}</span>
				</div>
			)}

			<div className="rounded-md border px-4 py-3 space-y-1">
				<p className="font-medium text-muted-foreground">Message</p>
				<p>{notification.message}</p>
			</div>
		</div>
	);
}
