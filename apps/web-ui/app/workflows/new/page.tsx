import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateWorkflowForm } from "@/components/workflows/create-workflow-form";

export default function NewWorkflowPage() {
	return (
		<div className="mx-auto max-w-2xl space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/workflows">← Back</Link>
				</Button>
				<h1 className="text-xl font-semibold">New workflow</h1>
			</div>
			<CreateWorkflowForm />
		</div>
	);
}
