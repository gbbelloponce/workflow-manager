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
	DropdownMenuSeparator,
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
import { EventViewDialog } from "./event-view-dialog";

type Event = RouterOutputs["eventsRouter"]["getAll"][number];

export function EventsTable() {
	const trpc = useTRPC();
	const [viewEvent, setViewEvent] = useState<Event | null>(null);

	const { data: events, isLoading } = useQuery(
		trpc.eventsRouter.getAll.queryOptions(),
	);

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading events…</p>;
	}

	if (!events?.length) {
		return (
			<p className="text-muted-foreground text-sm">
				No events yet. Trigger a workflow to get started.
			</p>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Workflow</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Actual value</TableHead>
						<TableHead>Triggered at</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.map((event) => (
						<TableRow key={event.id}>
							<TableCell className="font-medium">
								{event.workflow.name}
							</TableCell>
							<TableCell>
								<Badge
									variant={event.status === "OPEN" ? "default" : "secondary"}
								>
									{event.status}
								</Badge>
							</TableCell>
							<TableCell className="font-mono">{event.actualValue}</TableCell>
							<TableCell className="text-muted-foreground">
								{new Date(event.createdAt).toLocaleString()}
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
										<DropdownMenuItem onSelect={() => setViewEvent(event)}>
											View
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem disabled={event.status === "RESOLVED"}>
											Resolve
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<EventViewDialog event={viewEvent} onClose={() => setViewEvent(null)} />
		</>
	);
}
