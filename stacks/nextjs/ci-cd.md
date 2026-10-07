# CI/CD — Next.js Stack

> Implements the gate layers from `playbooks/core/ci-cd.md`: husky v9 hooks,
> lifecycle scripts, and the shipped GitHub Actions workflow.

## Git Hooks — husky v9 + lint-staged

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

`husky init` creates `.husky/pre-commit` and adds the `prepare` script so every clone installs hooks automatically. Hooks are plain shell files in v9 — no sourcing boilerplate. Replace the generated `pnpm test` line:

```bash
# .husky/pre-commit        (staged files only — stays under 5s)
pnpm exec lint-staged
```

```bash
# .husky/pre-push          (the heavier local layer)
pnpm run typecheck
pnpm exec vitest run --changed
```

```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["oxlint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

lint-staged auto-stages its fixes — never add `git add` to the tasks.

## Lifecycle Scripts

```json
// package.json
"scripts": {
  "prepare": "husky",
  "predev": "tsx scripts/check-env.ts",
  "dev": "next dev",
  "prebuild": "tsx scripts/check-env.ts",
  "build": "next build",
  "postinstall": "prisma generate",
  "typecheck": "tsc --noEmit",
  "lint": "oxlint",
  "test": "vitest run"
}
```

```ts
// scripts/check-env.ts — asserts the env schema before anything runs
import { env } from "../lib/env"

console.log(`env OK (${Object.keys(env).length} vars validated)`)
```

`lib/env.ts` is the same Zod schema from `playbooks/core/deployment.md` — one schema, asserted at dev start, build start, and runtime import.

## GitHub Actions — `gates.yml`

`setup.sh` ships `.github/workflows/gates.yml` ([checks.md](./checks.md)): it installs from the lockfile, then runs the `typecheck`, `lint`, and `test` scripts, the design gate when `DESIGN.md` exists, and `build`. Its actions are pinned by commit SHA, and Dependabot bumps them monthly. Per project, add only what the project needs:

- **Build-time env:** `prebuild` asserts the env schema, so give the job what it checks — placeholders in a job-level `env:`, test-mode keys from repo secrets, never live keys. Add each secret twice, as an Actions secret and a Dependabot secret: workflows on Dependabot PRs read only Dependabot secrets.
- **A database for integration tests:** a Postgres service at production's major version, plus a `pnpm exec prisma migrate deploy` step before `test`:
  ```yaml
      services:
        postgres:
          image: postgres:18 # production's major
          env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
          ports: ["5432:5432"]
          options: >-
            --health-cmd pg_isready --health-interval 5s
            --health-timeout 5s --health-retries 5
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/test
  ```
- **Branch ruleset on `main`:** require a pull request and the `gates` check ([checks.md](./checks.md)).
- **E2E:** Vercel builds a preview deployment per PR; run the Playwright critical paths against the preview URL as a separate job.

## Rules

- **Hooks are speed-tiered:** lint-staged on commit, typecheck + affected tests on push, everything in CI.
- **`predev`/`prebuild` assert the env schema** — misconfiguration fails in seconds, locally and in CI.
- **CI steps call the package scripts,** which match checks.md — one definition of passing.
- **`main` requires the `gates` check** — that's what turns the definition-of-done into law.
