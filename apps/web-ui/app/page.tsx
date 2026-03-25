"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";

export default function Page() {
	const trpc = useTRPC();
	const { data, isLoading } = useQuery(
		trpc.appRouter.hello.queryOptions({ name: "workflow-manager" }),
	);

	if (isLoading) return <p>Loading...</p>;
	return <p>{data?.greeting}</p>;
}
