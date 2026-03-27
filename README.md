# Workflow Manager

> This project is a response to an interview challenge. The base requirements asked for a workflow/alert management system; the extra feature I added on top is the ability to leave a comment when resolving an event.

A monorepo that lets you define alert workflows, trigger them with a metric value, and track the resulting events and notifications.

---

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://www.docker.com) (for the database)

### Setup

**1. Install dependencies**

```bash
bun install
```

**2. Configure environment variables**

```bash
cp apps/api/.env.sample apps/api/.env
cp apps/web-ui/.env.sample apps/web-ui/.env.local
```

The defaults work out of the box for local development — no changes needed unless you're running the database on a different port.

**3. Start the database**

```bash
docker compose up -d
```

**4. Run migrations**

```bash
cd apps/api && bun run db:migrate:dev
```

**5. Seed the database** *(optional but recommended)*

```bash
bun run db:seed
```

This creates a few workflows in different states (active/inactive, threshold/variance), two events (one open, one resolved), and their associated notifications so the app has something to show on first load.

**6. Start the development servers**

From the repo root:

```bash
bun dev
```

This starts both the API (port 8000) and the web UI (port 3000) in parallel.

| Service | URL |
|---------|-----|
| Web UI  | http://localhost:3000 |
| API     | http://localhost:8000 |

---

### Architecture decisions

**Monorepo with Bun workspaces** — both apps live in the same repo so the tRPC type contract between API and frontend can be enforced at the workspace level without publishing packages.

**tRPC end-to-end type safety** — the API generates a `server.ts` file (`apps/api/src/@generated/server.ts`) that exports the `AppRouter` type. The web UI imports only that type, so any change to a procedure's input or output immediately surfaces as a TypeScript error in the frontend. No manual type sync, no codegen step needed on the client side.

**NestJS + nestjs-trpc** — each domain (workflows, events, notifications, trigger) is a self-contained NestJS module with its own router, service, and schemas file. Routers are thin and delegate everything to services. Business logic never leaks into the transport layer.

**Trigger evaluation is isolated** — `TriggerService` is the single entry point for both manual triggers (from the UI) and any future automated triggers. It enforces the two core invariants: workflow must be active, and no open event can already exist for that workflow.

**Notifications are write-only** — notifications are saved to the database as `QUEUED` immediately after an event is created. Actual delivery (email, push) is intentionally out of scope; the schema is designed so a background worker could pick up `QUEUED` records and mark them `DELIVERED`.
