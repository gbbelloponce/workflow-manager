"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/lib/trpc/react";
import type { RouterOutputs } from "@/lib/trpc/types";

interface WorkflowViewDialogProps {
	workflowId: string | null;
	onClose: () => void;
	onTrigger: (workflowId: string) => void;
}

export function WorkflowViewDialog({
	workflowId,
	onClose,
	onTrigger,
}: WorkflowViewDialogProps) {
	const trpc = useTRPC();

	const { data: workflow, isLoading } = useQuery({
		...trpc.workflowsRouter.getById.queryOptions({ id: workflowId ?? "" }),
		enabled: workflowId !== null,
	});

	return (
		<Dialog
			open={workflowId !== null}
			onOpenChange={(open) => !open && onClose()}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Workflow details</DialogTitle>
				</DialogHeader>

				{isLoading && (
					<p className="text-muted-foreground text-sm py-2">Loading…</p>
				)}

				{workflow && <WorkflowDetails workflow={workflow} />}

				<DialogFooter>
					<Button
						variant="secondary"
						disabled={!workflow}
						onClick={() => {
							if (workflowId) {
								onClose();
								onTrigger(workflowId);
							}
						}}
					>
						Trigger manually
					</Button>
					<Button variant="outline" disabled={!workflow} asChild>
						<Link href={`/workflows/${workflowId}`} onClick={onClose}>
							Edit
						</Link>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ---------------------------------------------------------------------------
// Detail sections
// ---------------------------------------------------------------------------

type WorkflowDetail = RouterOutputs["workflowsRouter"]["getById"];

const OPERATOR_LABELS: Record<string, string> = {
	GT: ">",
	LT: "<",
	GTE: "≥",
	LTE: "≤",
	EQ: "=",
};

const CHANNEL_LABELS: Record<string, string> = {
	EMAIL: "Email",
	IN_APP: "In-app",
};

function WorkflowDetails({ workflow }: { workflow: WorkflowDetail }) {
	return (
		<div className="space-y-4 text-sm">
			<Field label="Name" value={workflow.name} />
			<Field label="Message" value={workflow.message} />

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Status</span>
				<Badge variant={workflow.isActive ? "default" : "secondary"}>
					{workflow.isActive ? "Active" : "Inactive"}
				</Badge>
			</div>

			<div className="flex items-center justify-between">
				<span className="text-muted-foreground">Trigger type</span>
				<Badge variant="outline">{workflow.triggerType}</Badge>
			</div>

			{workflow.triggerType === "THRESHOLD" && workflow.thresholdConfig && (
				<Section label="Threshold condition">
					<Field label="Metric" value={workflow.thresholdConfig.metricName} />
					<Field
						label="Operator"
						value={
							OPERATOR_LABELS[workflow.thresholdConfig.operator] ??
							workflow.thresholdConfig.operator
						}
					/>
					<Field label="Value" value={String(workflow.thresholdConfig.value)} />
				</Section>
			)}

			{workflow.triggerType === "VARIANCE" && workflow.varianceConfig && (
				<Section label="Variance condition">
					<Field
						label="Base value"
						value={String(workflow.varianceConfig.baseValue)}
					/>
					<Field
						label="Deviation"
						value={`${workflow.varianceConfig.deviationPercent}%`}
					/>
				</Section>
			)}

			<Section label={`Recipients (${workflow.recipients.length})`}>
				{workflow.recipients.length === 0 ? (
					<p className="text-muted-foreground">No recipients.</p>
				) : (
					<ul className="space-y-1">
						{workflow.recipients.map((r) => (
							<li key={r.id} className="flex items-center justify-between">
								<span className="font-mono">{r.target}</span>
								<Badge variant="secondary" className="ml-2">
									{CHANNEL_LABELS[r.channel] ?? r.channel}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</Section>
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium text-right max-w-[60%] wrap-break-words">
				{value}
			</span>
		</div>
	);
}

function Section({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-md border px-4 py-3 space-y-2">
			<p className="font-medium text-muted-foreground">{label}</p>
			{children}
		</div>
	);
}
