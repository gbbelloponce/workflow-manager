import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

export const metadata: Metadata = {
	title: "Workflow Manager",
	description:
		"Define alert workflows, trigger them with a metric value, and track events and notifications.",
};

import { Nav } from "@/components/nav";
import { TRPCQueryProvider } from "@/components/providers/trpc-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"antialiased",
				fontMono.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<body>
				<TRPCQueryProvider>
					<ThemeProvider>
						<Nav />
						{children}
					</ThemeProvider>
				</TRPCQueryProvider>
				<Toaster richColors />
			</body>
		</html>
	);
}
