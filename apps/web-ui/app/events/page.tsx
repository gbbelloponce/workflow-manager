import { EventsTable } from "@/components/events/events-table";

export default function HistoryPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6">
			<h1 className="text-xl font-semibold">Events</h1>
			<EventsTable />
		</div>
	);
}
