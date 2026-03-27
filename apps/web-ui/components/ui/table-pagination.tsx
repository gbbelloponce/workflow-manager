import { Button } from "@/components/ui/button";

interface TablePaginationProps {
	page: number;
	totalPages: number;
	onPrev: () => void;
	onNext: () => void;
}

export function TablePagination({
	page,
	totalPages,
	onPrev,
	onNext,
}: TablePaginationProps) {
	if (totalPages <= 1) return null;
	return (
		<div className="flex items-center justify-end gap-2 pt-2">
			<span className="text-muted-foreground text-xs">
				Page {page} of {totalPages}
			</span>
			<Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={onNext}
				disabled={page >= totalPages}
			>
				Next
			</Button>
		</div>
	);
}
