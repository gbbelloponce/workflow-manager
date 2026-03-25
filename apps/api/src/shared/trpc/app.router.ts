import { Injectable } from "@nestjs/common";
import { Query, Router } from "nestjs-trpc";
import { z } from "zod";

@Injectable()
@Router()
export class AppRouter {
	@Query({
		input: z.object({ name: z.string().optional() }),
		output: z.object({ greeting: z.string() }),
	})
	hello({ input }: { input: { name?: string } }) {
		return { greeting: `Hello, ${input.name ?? "world"}!` };
	}
}
