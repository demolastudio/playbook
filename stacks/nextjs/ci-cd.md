# CI/CD — Next.js Stack

> Implements the gate layers from `playbooks/core/ci-cd.md`: husky v9 hooks,
> lifecycle scripts, and the GitHub Actions pipeline.

## Git Hooks — husky v9 + lint-staged

```bash
npm i -D husky lint-staged
npx husky init
```

`husky init` creates `.husky/pre-commit` and adds the `prepare` script so every clone installs hooks automatically. Hooks are plain shell files in v9 — no sourcing boilerplate.

```bash
# .husky/pre-commit        (staged files only — stays under 5s)
npx lint-staged
```

```bash
# .husky/pre-push          (the heavier local layer)
npx tsc --noEmit
npx vitest run --changed
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

## GitHub Actions — PR Pipeline

```yaml
# .github/workflows/ci.yml
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  checks:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 5s
          --health-timeout 5s --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

- The step commands are exactly [checks.md](./checks.md) — the pipeline invokes the definition of "passing", it doesn't define its own
- Branch-protect `main`: require the `checks` job, PRs only, no force-push
- Vercel builds preview deployments per PR; run Playwright critical paths against the preview URL as a separate job when E2E exists
- Secrets used in CI (test-mode Stripe keys) live in repo Actions secrets — never in the workflow file

## Rules

- **Hooks are speed-tiered:** lint-staged on commit, typecheck + affected tests on push, everything in CI.
- **`predev`/`prebuild` assert the env schema** — misconfiguration fails in seconds, locally and in CI.
- **CI steps call the package scripts,** which match checks.md — one definition of passing.
- **`main` is branch-protected** — that's what turns the definition-of-done into law.
