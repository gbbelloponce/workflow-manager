"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

export default function Page() {
	const trpc = useTRPC();
	const { data: workflows, isLoading } = useQuery(
		trpc.workflowsRouter.getAll.queryOptions(),
	);

	if (isLoading) return <p>Loading...</p>;

	return (
		<ul>
			{workflows?.map((workflow) => (
				<li key={workflow.id}>{workflow.name}</li>
			))}
		</ul>
	);
}
