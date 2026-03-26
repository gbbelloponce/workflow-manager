"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { WorkflowViewDialog } from "./workflow-view-dialog";

export function WorkflowsTable() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [triggerWorkflowId, setTriggerWorkflowId] = useState<string | null>(
		null,
	);
	const [viewWorkflowId, setViewWorkflowId] = useState<string | null>(null);

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
						<TableHead className="w-10" />
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
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Open actions menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onSelect={() => setViewWorkflowId(wf.id)}>
											View
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/workflows/${wf.id}`}>Edit</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setTriggerWorkflowId(wf.id)}
										>
											Trigger manually
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => setDeleteId(wf.id)}
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<TriggerWorkflowDialog
				workflowId={triggerWorkflowId}
				onClose={() => setTriggerWorkflowId(null)}
			/>

			<WorkflowViewDialog
				workflowId={viewWorkflowId}
				onClose={() => setViewWorkflowId(null)}
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
