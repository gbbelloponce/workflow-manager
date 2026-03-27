# Web UI — `apps/web-ui`

Next.js frontend running on port **3000**. Uses the App Router.

---

## Folder structure

```
app/                      # File-based routing (Next.js App Router)
├── layout.tsx            # Root layout — mounts providers (tRPC, theme, toaster)
├── page.tsx              # "/" → redirects to /workflows
├── workflows/
│   ├── page.tsx          # List all workflows
│   ├── new/page.tsx      # Create workflow form
│   └── [id]/page.tsx     # Edit / view workflow
├── events/
│   └── page.tsx
└── notifications/
    └── page.tsx

components/
├── ui/                   # shadcn/ui primitives — do not edit by hand
├── providers/
│   └── trpc-provider.tsx # QueryClient + TRPCProvider (mounted in root layout)
├── theme-provider.tsx
├── nav.tsx
├── workflows/            # Feature-scoped components
├── events/
└── notifications/

lib/
├── trpc/
│   ├── client.ts         # makeClient() — creates the tRPC HTTP client
│   ├── react.ts          # useTRPC() hook
│   ├── query-client.ts   # makeQueryClient() with global mutation error handler
│   ├── types.ts          # RouterOutputs helper type
│   └── error.ts          # getTRPCErrorMessage() utility
└── hooks/
    └── use-debounce.ts
```

---

## tRPC

The app connects to the API via tRPC. There is no raw `fetch()` or REST calls — everything goes through the tRPC client.

### How the type contract works

The API generates a single file (`apps/api/src/@generated/server.ts`) that exports the `AppRouter` type. The web-ui imports **only the type** from the `api` workspace package:

```ts
import type { AppRouter } from "api/router";
```

Zero runtime API code enters the browser bundle. TypeScript enforces that every call matches the current procedure signatures — if the API changes a schema and you don't regenerate, the frontend will fail to compile.

### Using tRPC in a component

```tsx
"use client";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";

export function MyComponent() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.workflowsRouter.getAll.queryOptions({ page: 1 }));
  const mutation = useMutation(trpc.workflowsRouter.create.mutationOptions());
}
```

### Router namespaces

| API class | Client namespace |
|-----------|-----------------|
| `WorkflowsRouter` | `trpc.workflowsRouter.*` |
| `EventsRouter` | `trpc.eventsRouter.*` |
| `TriggerRouter` | `trpc.triggerRouter.*` |
| `NotificationsRouter` | `trpc.notificationsRouter.*` |

### Typing component props

Use `RouterOutputs` from `lib/trpc/types.ts` to infer the shape of procedure outputs:

```ts
import type { RouterOutputs } from "@/lib/trpc/types";

type Workflow = RouterOutputs["workflowsRouter"]["getById"];
```

### Global error handling

`makeQueryClient()` in `lib/trpc/query-client.ts` registers a global `mutations.onError` handler that automatically toasts tRPC errors via sonner — no per-mutation error handling needed.

---

## UI stack

- **Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Forms**: react-hook-form + @hookform/resolvers + Zod
- **Data fetching**: @tanstack/react-query v5
- **Toasts**: sonner
- **Icons**: lucide-react
- **Theme**: next-themes (light / dark)
