"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTRPCErrorMessage } from "@/lib/trpc/error";
import { useTRPC } from "@/lib/trpc/react";
import type { RouterOutputs } from "@/lib/trpc/types";

interface TriggerWorkflowDialogProps {
	workflowId: string | null;
	onClose: () => void;
}

export function TriggerWorkflowDialog({
	workflowId,
	onClose,
}: TriggerWorkflowDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [actualValue, setActualValue] = useState<string>("");

	const { data: workflow, isLoading } = useQuery({
		...trpc.workflowsRouter.getById.queryOptions({ id: workflowId ?? "" }),
		enabled: workflowId !== null,
	});

	const triggerMutation = useMutation({
		...trpc.triggerRouter.trigger.mutationOptions(),
		onSuccess: (result) => {
			if (result.triggered) {
				queryClient.invalidateQueries(
					trpc.workflowsRouter.getAll.queryFilter(),
				);
				queryClient.invalidateQueries(trpc.eventsRouter.getAll.queryFilter());
				queryClient.invalidateQueries(
					trpc.notificationsRouter.getAll.queryFilter(),
				);
				toast.success("Workflow triggered successfully");
			} else {
				toast.info("Condition not met — no event was created");
			}
			handleClose();
		},
		onError: (error) => {
			if (
				isTRPCClientError<AppRouter>(error) &&
				error.data?.code === "CONFLICT"
			) {
				toast.error("This workflow already has an open event");
			} else if (
				isTRPCClientError<AppRouter>(error) &&
				error.data?.code === "FORBIDDEN"
			) {
				toast.error("Workflow is inactive");
			} else {
				toast.error(getTRPCErrorMessage(error));
			}
		},
	});

	function handleClose() {
		onClose();
		setActualValue("");
	}

	function handleConfirm() {
		if (workflowId === null) return;
		triggerMutation.mutate({
			workflowId,
			actualValue: Number(actualValue),
		});
	}

	return (
		<Dialog
			open={workflowId !== null}
			onOpenChange={(open) => !open && handleClose()}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Trigger workflow manually</DialogTitle>
					<DialogDescription>
						Enter a metric value to evaluate this workflow against its
						configured condition.
					</DialogDescription>
				</DialogHeader>

				{isLoading && (
					<p className="text-muted-foreground text-sm py-2">
						Loading workflow config…
					</p>
				)}

				{workflow && (
					<div className="space-y-4">
						<ConfigSummary workflow={workflow} />
						<div className="grid gap-2">
							<Label htmlFor="actual-value">Metric value</Label>
							<Input
								id="actual-value"
								type="number"
								value={actualValue}
								onChange={(e) => setActualValue(e.target.value)}
								placeholder="e.g. 42"
							/>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={
							triggerMutation.isPending || actualValue === "" || isLoading
						}
					>
						{triggerMutation.isPending ? "Triggering…" : "Trigger"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

type WorkflowDetail = RouterOutputs["workflowsRouter"]["getById"];

function ConfigSummary({ workflow }: { workflow: WorkflowDetail }) {
	if (workflow.triggerType === "THRESHOLD" && workflow.thresholdConfig) {
		const { metricName, operator, value } = workflow.thresholdConfig;
		return (
			<div className="rounded-md border px-4 py-3 text-sm space-y-1">
				<p className="font-medium text-muted-foreground">Threshold condition</p>
				<p>
					<span className="font-mono">{metricName}</span>{" "}
					<span className="font-mono text-primary">
						{OPERATOR_LABELS[operator]}
					</span>{" "}
					<span className="font-mono font-semibold">{value}</span>
				</p>
			</div>
		);
	}

	if (workflow.triggerType === "VARIANCE" && workflow.varianceConfig) {
		const { baseValue, deviationPercent } = workflow.varianceConfig;
		return (
			<div className="rounded-md border px-4 py-3 text-sm space-y-1">
				<p className="font-medium text-muted-foreground">Variance condition</p>
				<p>
					Deviation from base value{" "}
					<span className="font-mono font-semibold">{baseValue}</span> exceeds{" "}
					<span className="font-mono font-semibold">{deviationPercent}%</span>
				</p>
			</div>
		);
	}

	return null;
}

const OPERATOR_LABELS: Record<string, string> = {
	GT: ">",
	LT: "<",
	GTE: "≥",
	LTE: "≤",
	EQ: "=",
};
