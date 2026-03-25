# web-ui

Next.js 16 frontend (App Router). Talks to `apps/api` via tRPC.

## Scripts

```bash
bun run dev          # Next.js dev server with Turbopack
bun run typecheck    # tsc --noEmit
bun run build        # production build
```

## Stack

- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Data fetching**: tRPC + TanStack Query v5
- **Theme**: next-themes (press `d` to toggle dark mode in dev)

## Import Alias

Always use `@/` for imports within `web-ui` — it maps to the app root (`apps/web-ui/`). Never use relative paths like `../../lib/...`.

## Folder Structure

```
app/                          # Next.js App Router pages
components/
  ui/                         # shadcn components
  providers/
    trpc-provider.tsx         # QueryClient + tRPC provider tree (mounted in layout)
lib/
  trpc/
    client.ts                 # HTTP client factory — change API URL here
    react.ts                  # useTRPC hook (client components only)
    query-client.ts           # QueryClient factory
```

## tRPC — Using Procedures in Components

Client components only — must have `"use client"`:

```tsx
"use client";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.featureRouter.myProcedure.queryOptions({ ... }));
  // ...
}
```

For mutations:

```tsx
const mutation = useMutation(trpc.featureRouter.myProcedure.mutationOptions());
mutation.mutate({ ... });
```

## tRPC — Router Namespace

The class name in the API maps to the namespace here:
- `AppRouter` → `trpc.appRouter.*`
- `UsersRouter` → `trpc.usersRouter.*`

## API URL

Defaults to `http://localhost:8000/trpc`. Override with `NEXT_PUBLIC_API_URL` env var for other environments (set in `.env.local`).
