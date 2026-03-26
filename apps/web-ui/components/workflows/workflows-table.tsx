"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getTRPCErrorMessage } from "@/lib/trpc/error";
import { useTRPC } from "@/lib/trpc/react";
import { TriggerWorkflowDialog } from "./trigger-workflow-dialog";

export function WorkflowsTable() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [triggerWorkflowId, setTriggerWorkflowId] = useState<string | null>(
		null,
	);

	const { data: workflows, isLoading } = useQuery(
		trpc.workflowsRouter.getAll.queryOptions(),
	);

	const updateMutation = useMutation({
		...trpc.workflowsRouter.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.workflowsRouter.getAll.queryFilter());
		},
		onError: (error) => {
			toast.error(getTRPCErrorMessage(error));
		},
	});

	const deleteMutation = useMutation({
		...trpc.workflowsRouter.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.workflowsRouter.getAll.queryFilter());
			toast.success("Workflow deleted.");
			setDeleteId(null);
		},
		onError: (error) => {
			toast.error(getTRPCErrorMessage(error));
			setDeleteId(null);
		},
	});

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading workflows…</p>;
	}

	if (!workflows?.length) {
		return (
			<p className="text-muted-foreground text-sm">
				No workflows yet. Create one to get started.
			</p>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Trigger</TableHead>
						<TableHead>Recipients</TableHead>
						<TableHead>Active</TableHead>
						<TableHead className="text-right" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{workflows.map((wf) => (
						<TableRow key={wf.id}>
							<TableCell className="font-medium">{wf.name}</TableCell>
							<TableCell>
								<Badge variant="outline">{wf.triggerType}</Badge>
							</TableCell>
							<TableCell>{wf._count.recipients}</TableCell>
							<TableCell>
								<Switch
									checked={wf.isActive}
									onCheckedChange={(checked) =>
										updateMutation.mutate({ id: wf.id, isActive: checked })
									}
									disabled={updateMutation.isPending}
									aria-label={
										wf.isActive ? "Deactivate workflow" : "Activate workflow"
									}
								/>
							</TableCell>
							<TableCell className="flex justify-end gap-2">
								<Button
									variant="secondary"
									size="sm"
									onClick={() => setTriggerWorkflowId(wf.id)}
								>
									Trigger manually
								</Button>
								<Button variant="outline" size="sm" asChild>
									<Link href={`/workflows/${wf.id}`}>Edit</Link>
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setDeleteId(wf.id)}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TriggerWorkflowDialog
				workflowId={triggerWorkflowId}
				onClose={() => setTriggerWorkflowId(null)}
			/>

			<Dialog
				open={deleteId !== null}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete workflow?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. The workflow and all its
							configuration will be permanently deleted.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteId(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() =>
								deleteId && deleteMutation.mutate({ id: deleteId })
							}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting…" : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
