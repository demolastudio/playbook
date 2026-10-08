# Checks — Next.js Stack

Commands for the automated gates in `rules/definition-of-done.md`. Each gate is
a `package.json` script, and CI, hooks, and agents all run the scripts — one
definition of passing.

| Gate | Script | Command |
| ---- | ------ | ------- |
| Typecheck | `typecheck` | `tsc --noEmit` |
| Lint | `lint` | `oxlint` |
| Migrations (with a database) | `db:migrate` | `prisma migrate deploy` |
| Tests | `test` | `vitest run --passWithNoTests` |
| E2E (when present) | `test:e2e` | `playwright test` |
| Design (when `DESIGN.md` exists) | — | `bash scripts/check-design.sh` (`formats/design.md`) |
| Build (before deploy) | `build` | `next build` |

## Shipped Files

`setup.sh` copies [project-files/](./project-files/) into the project once.
It never overwrites: a re-run lists only the files that differ from the
playbook's copy, for you to compare and merge.

| File | Job |
| ---- | --- |
| `.github/workflows/gates.yml` | Runs the gate scripts on every PR and push to `main`, with a Postgres service for integration tests; actions pinned by commit SHA |
| `.github/dependabot.yml` | Scheduled, grouped, delayed update PRs (`core/ci-cd.md`) |
| `pnpm-workspace.yaml` | Release-age delay and provenance check on every install |
| `.oxlintrc.json` | The lint gate below |
| `vitest.config.mts` | Tests in plain Node, `@/` imports, one test file at a time (they share the database), `e2e/` left to Playwright |
| `scripts/check-design.sh` | The design gate |
| `.claude/settings.json` | No AI attribution on commits or PRs; registers the hook below |
| `.claude/hooks/session-start.sh` | Cloud sessions only: fetch `.playbook/` and `pnpm install`, so slash commands and gates work |

`gates.yml` installs with the pnpm version pinned in `package.json` —
`"packageManager": "pnpm@<version>"`, 11 or newer, set with
`pnpm pkg set packageManager=pnpm@<version>` — and a committed `pnpm-lock.yaml`.

The workflow reports; only branch protection enforces. On GitHub, add a branch
ruleset for `main` that requires a pull request and the `gates` status check
(GitHub lists the check once `gates.yml` has run).

## Lint: oxlint, not ESLint

TypeScript 7 (npm `latest` since 2026) ships no JS API yet, and typescript-eslint
supports only TypeScript `<6.1` — `eslint .` fails on a fresh project. oxlint
runs type-aware rules through `oxlint-tsgolint` and implements the React
Compiler rules natively (all but `config`/`gating`; none are on by default).

```bash
pnpm add -D oxlint oxlint-tsgolint
```

The config is the shipped `.oxlintrc.json`. Beyond correctness it enforces
kebab-case file names, arrow functions, and one-way imports: `lib/`,
`components/`, and `db/` never import a feature or a route, and no import cycle
passes. Its `typescript/no-deprecated`
turns every library's `@deprecated` tag into a failing gate whose message names
the replacement — upgrades announce their own renames, so the playbook never
keeps a rename list.

Prove the gate goes red once per project: plant a `setState` call inside a
`useEffect` and confirm `pnpm run lint` exits non-zero with
`react(set-state-in-effect)`, then delete the plant.

`nextjs/no-html-link-for-pages` (oxlint 1.87) flags every extension-less
internal `<a>`, route handlers included (`/api/export`, an OAuth start). Those
aren't pages, so they stay `<a>`; disable the rule on that line with the reason:
`{/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- route handler */}`.

## Optional: Automatic Enforcement (Claude Code Hooks)

Rules are probabilistic — the agent can skip them. Hooks are deterministic.
Two layers, merged into the shipped `.claude/settings.json`:

**1. PostToolUse — catch type errors the moment they happen** (fast feedback):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit --pretty false 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

**2. Stop — the definition-of-done gate, enforced** (the agent cannot finish
until the checks pass). Save as `.claude/hooks/done-gate.sh` and wire it to the
`Stop` event:

```bash
#!/usr/bin/env bash
input=$(cat)
if echo "$input" | grep -q '"stop_hook_active":true'; then exit 0; fi
errors=$(npx tsc --noEmit --pretty false 2>&1 | head -20)
if [ -n "$errors" ]; then
  echo "Definition-of-done gate failed — fix before finishing:" >&2
  echo "$errors" >&2
  exit 2
fi
```

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/done-gate.sh" }] }
    ]
  }
}
```

Gotchas: exit code 2 blocks (exit 1 is only a warning); the `stop_hook_active`
check prevents an infinite block loop. Extend the script with lint/tests once
typecheck-on-stop feels right for the project.
