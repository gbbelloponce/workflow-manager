# API — `apps/api`

NestJS + tRPC server running on port **8000**.

---

## Folder structure

```
src/
├── main.ts               # Bootstrap (port, CORS)
├── app.module.ts         # Root module — imports all feature and shared modules
│
├── @generated/
│   └── server.ts         # Auto-generated AppRouter type — do not edit by hand
│
├── features/             # One folder per domain
│   ├── workflows/
│   ├── events/
│   ├── notifications/
│   └── trigger/
│
└── shared/
    ├── trpc/             # tRPC instance and shared schemas
    └── db/               # Prisma service, schema, migrations, generated client
```

Each feature follows the same pattern:

| File | Role |
|------|------|
| `*.module.ts` | NestJS module (wires service + router as providers) |
| `*.router.ts` | tRPC router — thin, delegates everything to the service |
| `*.service.ts` | Business logic and Prisma access |
| `*.schemas.ts` | Zod input/output schemas for that domain |

---

## tRPC

Procedures are defined with `nestjs-trpc` decorators directly on the router class:

```ts
@Injectable()
@Router()
export class WorkflowsRouter {
  @Query()
  async getAll(@Input(WorkflowsGetAllInput) input: WorkflowsGetAllInputType) {
    return this.workflowsService.getAll(input);
  }
}
```

The class name becomes the sub-namespace on the client: `WorkflowsRouter` → `trpc.workflowsRouter.*`.

After any router or schema change, the `AppRouter` type must be regenerated so the web-ui picks up the new signature:

```bash
bun run generate           # one-shot
bun run generate:watch     # watch mode — run this alongside dev
```

The output lands in `src/@generated/server.ts`. The web-ui imports only that type — no runtime API code crosses into the browser bundle.

---

## Prisma

The schema is split into semantic files under `shared/db/models/`:

```
models/
├── workflow.prisma     # Workflow, ThresholdConfig, VarianceConfig
├── event.prisma        # Event
├── notification.prisma # Notification
├── recipient.prisma    # Recipient
└── enums.prisma        # TriggerType, Operator, EventStatus, NotificationStatus
```

`schema.prisma` at the root of `shared/db/` contains only the datasource and generator — the model files are composed automatically by Prisma.

`PrismaService` is provided by a `@Global()` module, so it's available in every feature service without explicit import.

Useful commands:

```bash
bun run db:migrate:dev   # create and apply a migration
bun run db:generate      # regenerate the Prisma client after schema changes
bun run db:seed          # seed with sample data
bun run db:studio        # open Prisma Studio
```

---

## Business logic

Routers are intentionally thin — they validate input and delegate. All logic lives in services.

The most important service is `features/trigger/trigger.service.ts`. It is the **single entry point** for triggering a workflow and enforces the two core invariants:

1. The workflow must be active
2. No open event can already exist for that workflow

Everything else triggered by an evaluation (creating the event, queuing notifications, interpolating the message template) also happens there.
