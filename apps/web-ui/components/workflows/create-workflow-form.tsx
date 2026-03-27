"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { getTRPCErrorMessage } from "@/lib/trpc/error";
import { useTRPC } from "@/lib/trpc/react";

const createWorkflowSchema = z.object({
	name: z.string().min(1, "Name is required"),
	triggerType: z.enum(["THRESHOLD", "VARIANCE"]),
	message: z.string().min(1, "Message is required"),
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
	recipients: z
		.array(
			z.object({
				channel: z.enum(["IN_APP", "EMAIL"]),
				target: z.string().min(1, "Target is required"),
			}),
		)
		.min(1, "At least one recipient is required"),
});

type FormValues = z.infer<typeof createWorkflowSchema>;

const OPERATOR_LABELS: Record<string, string> = {
	GT: "> (greater than)",
	GTE: ">= (greater than or equal)",
	LT: "< (less than)",
	LTE: "<= (less than or equal)",
	EQ: "= (equal to)",
};

export function CreateWorkflowForm() {
	const router = useRouter();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		resolver: zodResolver(createWorkflowSchema),
		defaultValues: {
			name: "",
			triggerType: "THRESHOLD",
			message: "",
			thresholdConfig: { metricName: "", operator: "GT", value: 0 },
			recipients: [{ channel: "EMAIL", target: "" }],
		},
	});

	const triggerType = useWatch({ control: form.control, name: "triggerType" });
	const recipientValues = useWatch({
		control: form.control,
		name: "recipients",
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "recipients",
	});

	const mutation = useMutation({
		...trpc.workflowsRouter.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries(trpc.workflowsRouter.getAll.queryFilter());
			toast.success("Workflow created.");
			router.push("/workflows");
		},
		onError: (error) => {
			toast.error(getTRPCErrorMessage(error));
		},
	});

	function onSubmit(values: FormValues) {
		// Strip the irrelevant config before submitting
		const payload: FormValues =
			values.triggerType === "THRESHOLD"
				? { ...values, varianceConfig: undefined }
				: { ...values, thresholdConfig: undefined };

		mutation.mutate(payload);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="CPU spike alert" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Trigger type */}
				<FormField
					control={form.control}
					name="triggerType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Trigger type</FormLabel>
							<Select
								onValueChange={(v) => {
									field.onChange(v);
									if (v === "THRESHOLD") {
										form.setValue("thresholdConfig", {
											metricName: "",
											operator: "GT",
											value: 0,
										});
										form.setValue("varianceConfig", undefined);
									} else {
										form.setValue("varianceConfig", {
											baseValue: 0,
											deviationPercent: 10,
										});
										form.setValue("thresholdConfig", undefined);
									}
								}}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="THRESHOLD">Threshold</SelectItem>
									<SelectItem value="VARIANCE">Variance</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Threshold config */}
				{triggerType === "THRESHOLD" && (
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
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
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
				{triggerType === "VARIANCE" && (
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

				{/* Recipients */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Recipients</span>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => append({ channel: "EMAIL", target: "" })}
						>
							Add recipient
						</Button>
					</div>

					{fields.map((field, index) => (
						<div key={field.id} className="flex items-start gap-2">
							<FormField
								control={form.control}
								name={`recipients.${index}.channel`}
								render={({ field: f }) => (
									<FormItem className="w-36 shrink-0">
										<Select onValueChange={f.onChange} defaultValue={f.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="EMAIL">Email</SelectItem>
												<SelectItem value="IN_APP">In-app</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name={`recipients.${index}.target`}
								render={({ field: f }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Input
												placeholder={
													recipientValues[index]?.channel === "IN_APP"
														? "username"
														: "user@example.com"
												}
												{...f}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{fields.length > 1 && (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => remove(index)}
									aria-label="Remove recipient"
								>
									✕
								</Button>
							)}
						</div>
					))}

					{form.formState.errors.recipients?.root && (
						<p className="text-destructive text-sm">
							{form.formState.errors.recipients.root.message}
						</p>
					)}
				</div>

				<Button type="submit" disabled={mutation.isPending} className="w-full">
					{mutation.isPending ? "Creating…" : "Create workflow"}
				</Button>
			</form>
		</Form>
	);
}
