"use client";

import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RouterOutputs } from "@/lib/trpc/types";

type Event = RouterOutputs["eventsRouter"]["getAll"][number];

interface EventViewDialogProps {
	event: Event | null;
	onClose: () => void;
}

export function EventViewDialog({ event, onClose }: EventViewDialogProps) {
	return (
		<Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Event details</DialogTitle>
				</DialogHeader>

				{event && <EventDetails event={event} />}
			</DialogContent>
		</Dialog>
	);
}

function EventDetails({ event }: { event: Event }) {
	return (
		<div className="space-y-4 text-sm">
			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Workflow</span>
				<span className="font-medium">{event.workflow.name}</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Trigger type</span>
				<Badge variant="outline">{event.workflow.triggerType}</Badge>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Status</span>
				<Badge variant={event.status === "OPEN" ? "default" : "secondary"}>
					{event.status}
				</Badge>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Actual value</span>
				<span className="font-mono font-semibold">{event.actualValue}</span>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Triggered at</span>
				<span>{new Date(event.createdAt).toLocaleString()}</span>
			</div>

			{event.resolvedAt && (
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">Resolved at</span>
					<span>{new Date(event.resolvedAt).toLocaleString()}</span>
				</div>
			)}

			{event.resolvedComment && (
				<div className="rounded-md border px-4 py-3 space-y-1">
					<p className="font-medium text-muted-foreground">Resolution note</p>
					<p>{event.resolvedComment}</p>
				</div>
			)}
		</div>
	);
}
