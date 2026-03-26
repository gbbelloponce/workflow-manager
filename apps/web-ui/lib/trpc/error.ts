import { isTRPCClientError, type TRPCClientError } from "@trpc/client";
import type { AppRouter } from "api/router";

// Derive the error code type directly from AppRouter — stays in sync automatically
type TRPCErrorData = NonNullable<TRPCClientError<AppRouter>["data"]>;
type TRPCErrorCode = TRPCErrorData["code"];

const CODE_MESSAGES: Partial<Record<TRPCErrorCode, string>> = {
	NOT_FOUND: "The requested resource was not found.",
	CONFLICT: "This action conflicts with existing data.",
	FORBIDDEN: "You are not allowed to perform this action.",
	BAD_REQUEST: "Invalid request. Please check your input.",
	INTERNAL_SERVER_ERROR: "Something went wrong on our end. Please try again.",
};

export function getTRPCErrorMessage(error: unknown): string {
	// isTRPCClientError is a typed guard — narrows to TRPCClientError<AppRouter>
	// so error.data.code is TRPCErrorCode (the real union), not string
	if (isTRPCClientError<AppRouter>(error)) {
		const code = error.data?.code;
		return (
			error.message ||
			(code !== undefined ? CODE_MESSAGES[code] : undefined) ||
			"An unexpected error occurred."
		);
	}
	return "An unexpected error occurred.";
}
