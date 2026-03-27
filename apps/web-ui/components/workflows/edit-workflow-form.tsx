"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getTRPCErrorMessage } from "@/lib/trpc/error";
import { useTRPC } from "@/lib/trpc/react";
import type { RouterOutputs } from "@/lib/trpc/types";

const editFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	message: z.string().min(1, "Message is required"),
	isActive: z.boolean(),
	thresholdConfig: z
		.object({
			metricName: z.string().min(1, "Metric name is required"),
			operator: z.enum(["GT", "LT", "GTE", "LTE", "EQ"]),
			value: z.number(),
		})
		.optional(),
	varianceConfig: z
		.object({
			baseValue: z.number(),
			deviationPercent: z.number().min(0).max(100),
		})
		.optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

type WorkflowDetail = RouterOutputs["workflowsRouter"]["getById"];

const OPERATOR_LABELS: Record<string, string> = {
	GT: "> (greater than)",
	GTE: ">= (greater than or equal)",
	LT: "< (less than)",
	LTE: "<= (less than or equal)",
	EQ: "= (equal to)",
};

export function EditWorkflowForm({ id }: { id: string }) {
	const trpc = useTRPC();
	const {
		data: workflow,
		isLoading,
		error,
	} = useQuery(trpc.workflowsRouter.getById.queryOptions({ id }));

	if (isLoading) {
		return <p className="text-muted-foreground text-sm">Loading…</p>;
	}

	if (error || !workflow) {
		return (
			<p className="text-destructive text-sm">
				{error ? getTRPCErrorMessage(error) : "Workflow not found."}
			</p>
		);
	}

	// Only mount the inner form once workflow is available so defaultValues are
	// always correct from the first render — avoids uncontrolled→controlled flip.
	return <EditFormInner id={id} workflow={workflow} />;
}

function EditFormInner({
	id,
	workflow,
}: {
	id: string;
	workflow: WorkflowDetail;
}) {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<EditFormValues>({
		resolver: zodResolver(editFormSchema),
		defaultValues: {
			name: workflow.name,
			message: workflow.message,
			isActive: workflow.isActive,
			thresholdConfig: workflow.thresholdConfig
				? {
						metricName: workflow.thresholdConfig.metricName,
						operator: workflow.thresholdConfig.operator,
						value: workflow.thresholdConfig.value,
					}
				: undefined,
			varianceConfig: workflow.varianceConfig
				? {
						baseValue: workflow.varianceConfig.baseValue,
						deviationPercent: workflow.varianceConfig.deviationPercent,
					}
				: undefined,
		},
	});

	const mutation = useMutation({
		...trpc.workflowsRouter.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.workflowsRouter.getAll.queryFilter());
			queryClient.invalidateQueries(
				trpc.workflowsRouter.getById.queryFilter({ id }),
			);
			toast.success("Workflow updated.");
			router.push("/workflows");
		},
		onError: (error) => {
			toast.error(getTRPCErrorMessage(error));
		},
	});

	function onSubmit(values: EditFormValues) {
		mutation.mutate({ id, ...values });
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Trigger type — read-only */}
				<div className="grid gap-2">
					<span className="text-xs/relaxed font-medium">Trigger type</span>
					<div>
						<Badge variant="outline" className="text-xs">
							{workflow.triggerType}
						</Badge>
					</div>
					<p className="text-muted-foreground text-xs">
						Trigger type cannot be changed after creation.
					</p>
				</div>

				{/* Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Message */}
				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Message</FormLabel>
							<FormControl>
								<Input placeholder="{{metric}} exceeded {{value}}" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Active toggle */}
				<FormField
					control={form.control}
					name="isActive"
					render={({ field }) => (
						<FormItem className="flex items-center justify-between rounded-md border p-4">
							<div className="space-y-0.5">
								<FormLabel>Active</FormLabel>
								<p className="text-muted-foreground text-xs">
									Inactive workflows cannot be triggered.
								</p>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* Threshold config */}
				{workflow.triggerType === "THRESHOLD" && (
					<fieldset className="space-y-4 rounded-md border p-4">
						<legend className="px-1 text-sm font-medium">
							Threshold configuration
						</legend>
						<FormField
							control={form.control}
							name="thresholdConfig.metricName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Metric name</FormLabel>
									<FormControl>
										<Input placeholder="cpu_usage" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="thresholdConfig.operator"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Operator</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{Object.entries(OPERATOR_LABELS).map(([val, label]) => (
													<SelectItem key={val} value={val}>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="thresholdConfig.value"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Value</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="any"
												{...field}
												value={
													Number.isNaN(field.value as number) ? "" : field.value
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</fieldset>
				)}

				{/* Variance config */}
				{workflow.triggerType === "VARIANCE" && (
					<fieldset className="space-y-4 rounded-md border p-4">
						<legend className="px-1 text-sm font-medium">
							Variance configuration
						</legend>
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="varianceConfig.baseValue"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Base value</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="any"
												{...field}
												value={
													Number.isNaN(field.value as number) ? "" : field.value
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="varianceConfig.deviationPercent"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Deviation %</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="100"
												step="any"
												{...field}
												value={
													Number.isNaN(field.value as number) ? "" : field.value
												}
												onChange={(e) => field.onChange(e.target.valueAsNumber)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</fieldset>
				)}

				<Button type="submit" disabled={mutation.isPending} className="w-full">
					{mutation.isPending ? "Saving…" : "Save changes"}
				</Button>
			</form>
		</Form>
	);
}
