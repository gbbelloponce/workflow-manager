import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditWorkflowForm } from "@/components/workflows/edit-workflow-form";

export default async function EditWorkflowPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/workflows">← Back</Link>
				</Button>
				<h1 className="text-xl font-semibold">Edit workflow</h1>
			</div>
			<EditWorkflowForm id={id} />
		</div>
	);
}
