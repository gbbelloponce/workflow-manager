import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import type { AppRouter } from "api/router";

export function makeClient() {
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchStreamLink({
				url: process.env.NEXT_PUBLIC_API_URL
					? `${process.env.NEXT_PUBLIC_API_URL}/trpc`
					: "http://localhost:8000/trpc",
			}),
		],
	});
}
