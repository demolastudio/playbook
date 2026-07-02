# Stack — Turborepo

> **Status:** Outline only.
>
> Turborepo is a repo shape, not a framework — it **composes with** the other
> stack profiles. In a Turborepo project, read this file AND the profile for
> each app (e.g. `stacks/nextjs/STACK.md` for `apps/web`).

## Conventions (to be expanded)

- Apps live in `apps/`, shared code in `packages/` — a business rule used by two apps moves to a package (single source of truth across the monorepo).
- Shared Zod schemas and types belong in a dedicated package (e.g. `packages/schemas`), never duplicated per app.
- Definition-of-done gates run through Turbo so caching applies: `npx turbo run typecheck lint test`.

## Planned Sections

- [ ] Package boundaries — what earns its own package vs. stays in an app
- [ ] `checks.md` with turbo pipeline commands
- [ ] Versioning/publishing conventions for internal packages
