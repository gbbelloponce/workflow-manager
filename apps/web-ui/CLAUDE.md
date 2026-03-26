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
app/
  workflows/
    page.tsx              # workflow list
    new/
      page.tsx            # create workflow form
    [id]/
      page.tsx            # workflow detail / edit
  events/
    page.tsx              # event list
  layout.tsx
components/
  ui/                     # shadcn components — do not edit manually
  workflows/              # workflow-specific components
  events/                 # event/history-specific components
  providers/
    trpc-provider.tsx     # QueryClient + tRPC provider tree (mounted in layout)
lib/
  trpc/
    client.ts             # HTTP client factory — change API URL here
    react.ts              # useTRPC hook (client components only)
    query-client.ts       # QueryClient factory + global mutation error handler
    error.ts              # getTRPCErrorMessage() utility
    types.ts              # RouterOutputs type — derive response types from AppRouter
```

---

## tRPC — Using Procedures in Components

Client components only — must have `"use client"`:

```tsx
"use client";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.workflowsRouter.getAll.queryOptions({ page: 1 }));
}
```

For mutations:

```tsx
const mutation = useMutation(trpc.workflowsRouter.create.mutationOptions());
mutation.mutate({ name: "...", ... });
```

## tRPC — Router Namespace

The class name in the API maps to the namespace here:
- `WorkflowsRouter` → `trpc.workflowsRouter.*`
- `EventsRouter` → `trpc.eventsRouter.*`

## API URL

Defaults to `http://localhost:8000/trpc`. Override with `NEXT_PUBLIC_API_URL` env var (set in `.env.local`).

---

## Architecture Rules

### Components are display-only
- Components call tRPC and render data — no business logic, no derived calculations
- If you find yourself writing an `if` that encodes a business rule inside a component, move it to the API

### Server vs client components
- Prefer **server components** for data fetching (pages, layouts)
- Use **client components** (`"use client"`) only when interactivity is needed: forms, buttons, modals
- Never import server-only code into a client component

### Data fetching
- All data goes through the tRPC client — never use `fetch()` directly
- Keep tRPC setup isolated in `lib/trpc/` — don't instantiate clients inline in components

### Type safety
- Never use `any`
- Never ignore TypeScript errors with `@ts-ignore` or `@ts-expect-error` without a comment
- Zod schemas from the API are the source of truth — don't redefine them in the frontend

---

## tRPC — Router Output Types

To type component props with tRPC response shapes, use `RouterOutputs` from `@/lib/trpc/types`:

```ts
import type { RouterOutputs } from "@/lib/trpc/types";

type WorkflowDetail = RouterOutputs["workflowsRouter"]["getById"];
type WorkflowSummary = RouterOutputs["workflowsRouter"]["getAll"][number];
```

`@trpc/server` is listed as a devDependency solely for `inferRouterOutputs` — it has zero runtime footprint.

**Pattern for forms that edit fetched data**: split into a loading wrapper + an inner component that only mounts when data is ready. Pass the loaded data as props so `useForm({ defaultValues })` is always pre-filled from the first render — avoids the uncontrolled→controlled input warning.

```tsx
export function EditFoo({ id }: { id: string }) {
  const { data, isLoading } = useQuery(...);
  if (isLoading) return <Skeleton />;
  if (!data) return <NotFound />;
  return <EditFooForm data={data} />; // mounts once, defaultValues always correct
}
```

---

## Error Handling

Toast library: **sonner** (installed via shadcn). `<Toaster richColors />` is mounted in `app/layout.tsx`.

Global mutation errors fire automatically as toasts via `QueryClient` `defaultOptions.mutations.onError` in `lib/trpc/query-client.ts` — no per-component boilerplate needed for generic errors.

For per-mutation overrides (e.g. success messages or custom error text):

```tsx
const mutation = useMutation({
  ...trpc.workflowsRouter.create.mutationOptions(),
  onSuccess: () => toast.success("Workflow created."),
  onError: (error) => toast.error(getTRPCErrorMessage(error)),
});
```

`getTRPCErrorMessage(error)` lives in `@/lib/trpc/error.ts` — maps tRPC error codes (`NOT_FOUND`, `CONFLICT`, `FORBIDDEN`, `BAD_REQUEST`) to user-friendly strings and falls back to the server's raw message.

---

## UI Patterns

### Forms
- Use controlled components with `useState` or `react-hook-form`
- Trigger type selection (`THRESHOLD` / `VARIANCE`) should conditionally render different field groups
- Recipient list should support adding and removing rows dynamically

### Workflow list
- Each row has: name, trigger type badge, active/inactive toggle, "Trigger manually" button
- The trigger button calls `workflowsRouter.trigger` and invalidates the events query on success

### Events
- Filterable by workflow (select dropdown) and status (`OPEN` / `RESOLVED`)
- Paginated — show current page and total
- OPEN events show a "Resolve" button that opens a modal
- Resolve modal has an optional comment textarea and a confirm button

### Error handling
- Show user-friendly messages for `CONFLICT` (e.g. "This workflow already has an open event")
- Show user-friendly messages for `FORBIDDEN` (e.g. "Workflow is inactive")
- Use shadcn `toast` for mutation feedback (success and error)