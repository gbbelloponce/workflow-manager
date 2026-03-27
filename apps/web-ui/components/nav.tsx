"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/workflows", label: "Workflows" },
	{ href: "/events", label: "Events" },
	{ href: "/notifications", label: "Notifications" },
];

export function Nav() {
	const pathname = usePathname();
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<nav className="border-b">
			<div className="mx-auto flex max-w-5xl items-center gap-6 px-6 h-12">
				<Link href="/" className="text-sm font-semibold mr-2">
					Workflow Manager
				</Link>
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
				<div className="ml-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={() =>
							setTheme(resolvedTheme === "dark" ? "light" : "dark")
						}
						aria-label="Toggle theme"
					>
						<Sun className="size-4 dark:hidden" />
						<Moon className="size-4 hidden dark:block" />
					</Button>
				</div>
			</div>
		</nav>
	);
}
