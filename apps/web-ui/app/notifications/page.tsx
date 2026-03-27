import { NotificationsTable } from "@/components/notifications/notifications-table";

export default function NotificationsPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6">
			<h1 className="text-xl font-semibold">Notifications</h1>
			<NotificationsTable />
		</div>
	);
}
