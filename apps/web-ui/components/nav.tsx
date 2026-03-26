"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/workflows", label: "Workflows" },
	{ href: "/events", label: "Events" },
];

export function Nav() {
	const pathname = usePathname();

	return (
		<nav className="border-b">
			<div className="mx-auto flex max-w-5xl items-center gap-6 px-6 h-12">
				{links.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						className={cn(
							"text-sm font-medium transition-colors",
							pathname.startsWith(href)
								? "text-foreground"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{label}
					</Link>
				))}
			</div>
		</nav>
	);
}
