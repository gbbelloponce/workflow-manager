"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/lib/trpc/react";
import type { RouterOutputs } from "@/lib/trpc/types";
import { NotificationViewDialog } from "./notification-view-dialog";

type Notification = RouterOutputs["notificationsRouter"]["getAll"][number];

export function NotificationsTable() {
	const trpc = useTRPC();
	const [viewNotification, setViewNotification] = useState<Notification | null>(
		null,
	);

	const { data: notifications, isLoading } = useQuery(
		trpc.notificationsRouter.getAll.queryOptions(),
	);

	if (isLoading) {
		return (
			<p className="text-muted-foreground text-sm">Loading notifications…</p>
		);
	}

	if (!notifications?.length) {
		return (
			<p className="text-muted-foreground text-sm">
				No notifications yet. Trigger a workflow to get started.
			</p>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Workflow</TableHead>
						<TableHead>Channel</TableHead>
						<TableHead>Target</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Sent at</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{notifications.map((notification) => (
						<TableRow key={notification.id}>
							<TableCell className="font-medium">
								{notification.event.workflow.name}
							</TableCell>
							<TableCell>
								<Badge variant="outline">{notification.channel}</Badge>
							</TableCell>
							<TableCell className="font-mono">{notification.target}</TableCell>
							<TableCell>
								<Badge
									variant={
										notification.status === "DELIVERED"
											? "default"
											: "secondary"
									}
								>
									{notification.status}
								</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{new Date(notification.createdAt).toLocaleString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Open actions menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onSelect={() => setViewNotification(notification)}
										>
											View
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<NotificationViewDialog
				notification={viewNotification}
				onClose={() => setViewNotification(null)}
			/>
		</>
	);
}
