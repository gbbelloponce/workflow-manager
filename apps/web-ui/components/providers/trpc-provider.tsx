"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { makeClient } from "@/lib/trpc/client";
import { makeQueryClient } from "@/lib/trpc/query-client";
import { TRPCProvider } from "@/lib/trpc/react";

let clientQueryClient: QueryClient | undefined;

function getQueryClient() {
	if (typeof window === "undefined") return makeQueryClient();
	if (!clientQueryClient) clientQueryClient = makeQueryClient();
	return clientQueryClient;
}

export function TRPCQueryProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() => makeClient());

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
