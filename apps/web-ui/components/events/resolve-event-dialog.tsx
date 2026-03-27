"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isTRPCClientError } from "@trpc/client";
import type { AppRouter } from "api/router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTRPCErrorMessage } from "@/lib/trpc/error";
import { useTRPC } from "@/lib/trpc/react";

interface ResolveEventDialogProps {
	eventId: string | null;
	onClose: () => void;
}

export function ResolveEventDialog({
	eventId,
	onClose,
}: ResolveEventDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [comment, setComment] = useState("");

	const resolveMutation = useMutation({
		...trpc.eventsRouter.resolve.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.eventsRouter.getAll.queryFilter());
			toast.success("Event resolved.");
			handleClose();
		},
		onError: (error) => {
			if (
				isTRPCClientError<AppRouter>(error) &&
				error.data?.code === "CONFLICT"
			) {
				toast.error("Event is already resolved.");
			} else {
				toast.error(getTRPCErrorMessage(error));
			}
		},
	});

	function handleClose() {
		onClose();
		setComment("");
	}

	function handleConfirm() {
		if (eventId === null) return;
		resolveMutation.mutate({
			id: eventId,
			...(comment.trim() && { resolvedComment: comment.trim() }),
		});
	}

	return (
		<Dialog
			open={eventId !== null}
			onOpenChange={(open) => !open && handleClose()}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Resolve event</DialogTitle>
					<DialogDescription>
						Mark this event as resolved. You can optionally add a note.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-2">
					<Label htmlFor="resolve-comment">Note (optional)</Label>
					<Textarea
						id="resolve-comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Describe how the issue was addressed…"
						rows={3}
					/>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={resolveMutation.isPending}>
						{resolveMutation.isPending ? "Resolving…" : "Resolve"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
