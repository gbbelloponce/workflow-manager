import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getTRPCErrorMessage } from "./error";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: { staleTime: 60 * 1000 },
			dehydrate: {
				shouldDehydrateQuery: (q) =>
					defaultShouldDehydrateQuery(q) || q.state.status === "pending",
			},
			mutations: {
				onError: (error) => {
					toast.error(getTRPCErrorMessage(error));
				},
			},
		},
	});
}
