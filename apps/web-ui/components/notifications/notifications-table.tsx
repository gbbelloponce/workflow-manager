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
import { TablePagination } from "@/components/ui/table-pagination";
import { WorkflowCombobox } from "@/components/workflows/workflow-combobox";
import { useTRPC } from "@/lib/trpc/react";
import type { RouterOutputs } from "@/lib/trpc/types";
import { NotificationViewDialog } from "./notification-view-dialog";

type Notification =
	RouterOutputs["notificationsRouter"]["getAll"]["items"][number];

export function NotificationsTable() {
	const trpc = useTRPC();
	const [viewNotification, setViewNotification] = useState<Notification | null>(
		null,
	);
	const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
	const [page, setPage] = useState(1);

	const { data, isLoading } = useQuery(
		trpc.notificationsRouter.getAll.queryOptions({
			page,
			pageSize: 10,
			workflowId,
		}),
	);
	const notifications = data?.items ?? [];
	const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

	const filterBar = (
		<div className="flex items-center gap-2 pb-4">
			<WorkflowCombobox
				value={workflowId}
				onChange={(id) => {
					setWorkflowId(id);
					setPage(1);
				}}
			/>
		</div>
	);

	if (isLoading) {
		return (
			<>
				{filterBar}
				<p className="text-muted-foreground text-sm">Loading notifications…</p>
			</>
		);
	}

	if (!notifications.length) {
		return (
			<>
				{filterBar}
				<p className="text-muted-foreground text-sm">
					{workflowId
						? "No notifications match your filters."
						: "No notifications yet. Trigger a workflow to get started."}
				</p>
			</>
		);
	}

	return (
		<>
			{filterBar}
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

			<TablePagination
				page={page}
				totalPages={totalPages}
				onPrev={() => setPage((p) => p - 1)}
				onNext={() => setPage((p) => p + 1)}
			/>

			<NotificationViewDialog
				notification={viewNotification}
				onClose={() => setViewNotification(null)}
			/>
		</>
	);
}
