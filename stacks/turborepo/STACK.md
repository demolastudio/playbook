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

## Guardrail Files

`setup.sh` copies no project files into a monorepo, because they are written for one app at the project root. Add them by hand from the app's stack (`.playbook/stacks/nextjs/project-files/`, plus `vinext-cloudflare/project-files/` for a vinext app):

- `pnpm-workspace.yaml` — merge its `minimumReleaseAge`, `trustPolicy`, and `allowBuilds` keys into the root file; keep the root file's `packages:`.
- `.claude/settings.json` and `.claude/hooks/session-start.sh` — copy to the root as they are.
- `.github/workflows/gates.yml` — copy to the root; its steps call the root `package.json` scripts, so give the root `typecheck`, `lint`, `test`, and `build` scripts that run `turbo run <name>`.
- `.oxlintrc.json` and `vitest.config.mts` — copy into each app that runs oxlint or Vitest.

## Planned Sections

- [ ] Package boundaries — what earns its own package vs. stays in an app
- [x] [checks.md](./checks.md) — turbo pipeline commands
- [ ] Versioning/publishing conventions for internal packages
