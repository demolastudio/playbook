# Stack — Next.js 16 + Prisma + Zod + Better Auth

> Read this when the project uses Next.js. Version-matched framework docs ship
> inside the package at `node_modules/next/dist/docs/` — they are the source of
> truth for Next.js APIs, not training data.

## Folder Layout

```
app/
├── (public)/             ← Public-facing pages
├── (admin)/              ← Admin/dashboard pages
└── api/                  ← Route handlers (webhooks and public APIs only)

types/                    ← All TypeScript types/interfaces
schemas/                  ← All Zod validation schemas
actions/                  ← All Server Actions
hooks/                    ← All custom React hooks
lib/                      ← Business logic, data access, utilities
components/               ← UI components
```

## Conventions

- **Arrow functions everywhere** (`const fn = async () => {}`) — never `function` declarations. Components export via `const Page = () => ...; export default Page`. (Global rule 9; the templates model it.)
- **Mutations are Server Actions.** Route handlers exist only for webhooks and endpoints external systems call.
- **Every mutation follows the same pipeline:** Better Auth session check → Zod parse → single-source-of-truth business function in `lib/` → audit log → typed result. The canonical shape is [templates/server-action.ts](./templates/server-action.ts).
- **Prisma stays in `lib/`.** No queries in components or actions — actions call business functions, business functions query.
- **Multi-step writes use transactions** with a business-derived idempotency key — see [templates/prisma-idempotent-transaction.ts](./templates/prisma-idempotent-transaction.ts) and `playbooks/core/idempotency.md`.
- **Zod schemas live in `schemas/`,** types are inferred with `z.infer` — see [templates/zod-schema.ts](./templates/zod-schema.ts). Never hand-write a type that a schema can infer.
- **Environment variables are validated at startup** through a single `lib/env.ts`; nothing reads `process.env` directly.

## Templates

New code copies the matching template — same structure, same error handling, same result shape:

| Creating | Copy |
| -------- | ---- |
| Server Action (mutation) | [templates/server-action.ts](./templates/server-action.ts) |
| Webhook route handler | [templates/route-handler.ts](./templates/route-handler.ts) |
| Transaction with idempotency | [templates/prisma-idempotent-transaction.ts](./templates/prisma-idempotent-transaction.ts) |
| Validation schema | [templates/zod-schema.ts](./templates/zod-schema.ts) |

## Performance

Next.js-specific implementation of the core performance budgets (PPR, `use cache`, next/image, next/font, bundle analysis): [performance.md](./performance.md).

## CI/CD

Husky v9 hooks, `predev`/`prebuild` env assertion, and the GitHub Actions pipeline: [ci-cd.md](./ci-cd.md).

## Definition-of-Done Commands

See [checks.md](./checks.md).
