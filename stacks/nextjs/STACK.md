# Stack — Next.js 16 + Prisma + Zod + Better Auth

> Read this when the project uses Next.js. Version-matched framework docs ship
> inside the package at `node_modules/next/dist/docs/` — they are the source of
> truth for Next.js APIs, not training data.

## Folder Layout

No `src/`. Rules and growth: `.playbook/rules/project-structure.md`.

```
app/                         ← routes only: (public)/, (admin)/, api/ (GET reads, webhooks)
features/
└── booking/
    ├── booking-schema.ts    ← Zod schemas; types via z.infer
    ├── booking-actions.ts   ← "use server" — each action is one defineAction(...)
    ├── booking-queries.ts   ← server-only reads for pages and GET routes
    ├── create-booking.ts    ← one use case per file: rule + audit row in one transaction
    ├── create-booking.test.ts  ← integration test against real Postgres
    └── components/          ← booking-form.tsx, slot-picker.tsx
components/ui/               ← shadcn primitives; components/ for app-wide composites
lib/                         ← define-action, logger, errors, auth, prisma (db), stripe — no business rules
prisma/                      ← schema.prisma + migrations
e2e/                         ← Playwright specs, one per money journey
proxy.ts                     ← request ID + security headers
instrumentation.ts           ← unhandled errors → logger
```

## Conventions

- **Arrow functions everywhere** (`const fn = async () => {}`) — never `function` declarations. Components export via `const Page = () => ...; export default Page`. (Global rule 9; lint enforces named functions.)
- **Mutations are Server Actions built with `defineAction`** — session guard, optional rate limit, Zod parse, request-scoped logging, and safe errors in one place. Server Components read through the feature's `-queries.ts`. Next.js dispatches Server Actions one at a time per client, so they never serve reads: data a Client Component fetches comes from a GET route handler (`Cache-Control: private, no-store`) through TanStack Query or SWR.
- **The use case owns the rule.** An action calls one use-case file; the use case runs the business rule and writes the audit row in the same transaction (`playbooks/core/audit-trails.md`). Components and actions never query the database directly.
- **Expected business failures throw `appError("message")`** — the user sees that message; anything else becomes a generic message and an error log.
- **Multi-step writes use transactions** with a business-derived idempotency key — see `playbooks/core/idempotency.md`.
- **Environment variables are validated at startup** through a single `lib/env.ts`; nothing reads `process.env` directly.

## Templates

New code copies the matching template — same structure, same error handling, same result shape:

| Creating | Copy | To |
| -------- | ---- | -- |
| Action pipeline (once per project) | [define-action.ts](./templates/define-action.ts), [errors.ts](./templates/errors.ts), [logger.ts](./templates/logger.ts) | `lib/` |
| Request ID + security headers (once) | [proxy.ts](./templates/proxy.ts), [instrumentation.ts](./templates/instrumentation.ts) | project root |
| Server Action | [server-action.ts](./templates/server-action.ts) | `features/<name>/<name>-actions.ts` |
| Validation schema | [zod-schema.ts](./templates/zod-schema.ts) | `features/<name>/<name>-schema.ts` |
| Transaction with idempotency | [prisma-idempotent-transaction.ts](./templates/prisma-idempotent-transaction.ts) | `features/<name>/<verb>-<name>.ts` |
| Webhook route handler | [route-handler.ts](./templates/route-handler.ts) | `app/api/webhooks/<provider>/route.ts` |

Rate limiting on Vercel: Arcjet (`playbooks/core/security.md`).

## Performance

Next.js-specific implementation of the core performance budgets (PPR, `use cache`, next/image, next/font, bundle analysis): [performance.md](./performance.md).

## CI/CD

Husky v9 hooks, `predev`/`prebuild` env assertion, and the GitHub Actions pipeline: [ci-cd.md](./ci-cd.md).

## Gotchas

Operational traps (version pins, non-interactive Prisma migrations, streaming status codes, the effects table, Zod 4 and Better Auth changes): [gotchas.md](./gotchas.md).

## Definition-of-Done Commands

See [checks.md](./checks.md) — lint is oxlint (TypeScript 7 breaks typescript-eslint).
