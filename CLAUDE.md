# workflow-manager

A monorepo managed with **bun workspaces**.

## Structure

```
workflow-manager/
├── apps/
│   ├── api/        # NestJS REST API
│   └── web-ui/     # Next.js frontend
├── package.json    # Root workspace config
└── biome.json      # Shared linter/formatter config
```

## Monorepo Commands

```bash
# Run all apps in dev mode
bun dev

# Lint & format (Biome — runs from root only)
bun lint

# Run a script in a specific app
bun run --filter '<app>' run <command>

# Clean
bun run clean
```

### Installing packages

> ⚠️ Do NOT use `--filter` for package installation — it adds to the root `package.json` instead.

```bash
cd apps/<app>
bun add <package>
```

## Tooling

- **Package manager**: bun (workspaces)
- **Linter/Formatter**: Biome (configured at root, runs on `apps/**`)
- **Git hooks**: Husky + lint-staged (Biome on staged files)

## tRPC — Type Flow Between Apps

tRPC connects `apps/api` (server) to `apps/web-ui` (client) with end-to-end type safety.

1. Procedures are defined in `apps/api/src/shared/trpc/` using `nestjs-trpc` decorators
2. `bun run generate` (inside `apps/api`) writes the inferred `AppRouter` type to `apps/api/src/@generated/server.ts` — do not edit by hand
3. `apps/web-ui` imports only that type via `import type { AppRouter } from "api/router"` — zero runtime code enters the browser bundle
4. At runtime, Next.js calls NestJS at `http://localhost:8000/trpc`

When working on tRPC procedures, run these in separate terminals:

```bash
cd apps/api && bun run dev             # API server
cd apps/api && bun run generate:watch  # regenerate types on router changes
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

Format: `<type>(<scope>): <description>`

**Types:** `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`, `ci`, `build`

**Scopes:**
- `api` — backend changes
- `web-ui` — frontend changes
- `api|web-ui` — changes spanning both apps
- Omit scope for global/root changes (e.g. `docs: ...`)

**Examples:**
- `feat(web-ui): add event creation page`
- `fix(api): prevent duplicate likes on same post`
- `chore(api|web-ui): update build configuration`
- `refactor(api): extract pagination helper`
- `docs: add claude context and code review files`

**Rules:**
- Use lowercase for description
- No period at the end
- Use imperative mood ("add", not "added" or "adds")
