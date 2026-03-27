"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useTRPC } from "@/lib/trpc/react";

interface WorkflowComboboxProps {
	value: string | undefined;
	onChange: (id: string | undefined) => void;
}

export function WorkflowCombobox({ value, onChange }: WorkflowComboboxProps) {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();

	const { data: workflows = [] } = useQuery(
		trpc.workflowsRouter.listNames.queryOptions(),
	);

	const selected = workflows.find((w) => w.id === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					role="combobox"
					className="h-8 w-48 justify-between font-normal"
				>
					<span className="truncate">{selected?.name ?? "All workflows"}</span>
					<ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-48 p-0" align="start">
				<Command>
					<CommandInput placeholder="Search workflows…" />
					<CommandList>
						<CommandEmpty>No workflows found.</CommandEmpty>
						<CommandGroup>
							<CommandItem
								value="all"
								data-checked={value === undefined}
								onSelect={() => {
									onChange(undefined);
									setOpen(false);
								}}
							>
								All workflows
							</CommandItem>
							{workflows.map((wf) => (
								<CommandItem
									key={wf.id}
									value={wf.name}
									data-checked={value === wf.id}
									onSelect={() => {
										onChange(wf.id);
										setOpen(false);
									}}
								>
									{wf.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
