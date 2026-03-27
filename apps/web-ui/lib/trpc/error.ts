import { isTRPCClientError } from "@trpc/client";
import type { AppRouter } from "api/router";

export function getTRPCErrorMessage(error: unknown): string {
	if (isTRPCClientError<AppRouter>(error)) {
		return error.message || "An unexpected error occurred.";
	}
	return "An unexpected error occurred.";
}
