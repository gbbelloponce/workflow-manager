import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkflowsTable } from "@/components/workflows/workflows-table";

export default function WorkflowsPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Workflows</h1>
				<Button asChild>
					<Link href="/workflows/new">New workflow</Link>
				</Button>
			</div>
			<WorkflowsTable />
		</div>
	);
}
