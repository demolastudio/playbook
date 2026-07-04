# Stack — NestJS

> **Status:** Outline only. Fill this in during the first NestJS project,
> the same way `stacks/nextjs/` was built.

The global rules and core playbook principles apply unchanged — only the tools differ.

## Concept Mapping (from the Next.js stack)

| Concern | Next.js stack | NestJS equivalent |
| ------- | ------------- | ----------------- |
| Validation schemas | Zod (`schemas/`) | class-validator DTOs or nestjs-zod (`dto/`) |
| Mutations | Server Actions (`actions/`) | Controllers → Services |
| ORM / data access | Prisma (`lib/`) | Prisma (same patterns apply directly) |
| Auth sessions | Better Auth | Guards + Passport or Better Auth adapter |
| Checks | `tsc` / `eslint` / `vitest` | `tsc` / `eslint` / `jest` or `vitest` |

## Planned Sections

- [ ] Module organization (one module per domain, shared `common/`)
- [ ] Guard/interceptor conventions for auth and audit logging
- [x] [checks.md](./checks.md) — gate commands
- [ ] `templates/` — controller, service with idempotent transaction, DTO
