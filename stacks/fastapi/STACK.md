# Stack — FastAPI

> **Status:** Outline only. Fill this in during the first FastAPI project,
> the same way `stacks/nextjs/` was built.

The global rules and core playbook principles (SSOT, never trust the client,
idempotency, audit everything) apply unchanged — only the tools differ.

## Concept Mapping (from the Next.js stack)

| Concern | Next.js stack | FastAPI equivalent |
| ------- | ------------- | ------------------ |
| Validation schemas | Zod (`features/<name>/<name>-schema.ts`) | Pydantic models (`schemas/`) |
| ORM / data access | Prisma, in feature use cases | SQLAlchemy or SQLModel (`services/`) |
| Auth sessions | Better Auth | fastapi-users or custom JWT/session deps |
| Typecheck gate | `tsc --noEmit` | `mypy` or `pyright` |
| Lint gate | `oxlint` | `ruff check` |
| Test gate | `vitest` | `pytest` |

## Planned Sections

- [ ] Folder layout grouped by feature per global rule 7 (router, schemas, service per domain; shared `core/`)
- [ ] Dependency-injection conventions (auth, DB session per request)
- [x] [checks.md](./checks.md) — gate commands
- [ ] `templates/` — router endpoint, Pydantic schema, idempotent service function
