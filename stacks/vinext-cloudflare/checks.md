# Checks — vinext + Cloudflare

Commands for the automated gates in `rules/definition-of-done.md`, as
`package.json` scripts — CI, hooks, and agents all run the scripts.

| Gate | Script | Command |
| ---- | ------ | ------- |
| Typecheck | `typecheck` | `cf workers types && tsc --noEmit` |
| Lint | `lint` | `oxlint` |
| Tests | `test` | `vitest run` |
| E2E (when present) | `test:e2e` | `playwright test` |
| Design (when `DESIGN.md` exists) | — | `bash scripts/check-design.sh` (`formats/design.md`) |
| Build (before deploy) | `build` | `vite build` |
| Post-deploy | — | `bash scripts/check-cache.sh https://<production host>` |

create-vinext-app 1.0 writes `dev`, `build`, `start`, and `deploy`; add
`typecheck`, `lint`, and `test`. No gate needs Cloudflare credentials (checked
on the scaffold with `CI=true`). Lint fails there only on the demo page's
`/api/hello` link — the link-rule exception in `stacks/nextjs/checks.md`.

`cf workers types` regenerates the binding types in `.cloudflare/types` (include
that directory in `tsconfig.json`); a stale copy hides a missing binding.

Shared with `stacks/nextjs/checks.md` and used as they are: the shipped files
and branch ruleset, the lint config and its link-rule exception, the
prove-it-red step, and the optional Claude Code hooks. This stack ships its own
`pnpm-workspace.yaml` ([gotchas.md](./gotchas.md#pnpm-11-and-the-cloudflare-prereleases))
and `scripts/check-cache.sh`.

## Post-Deploy Cache Check

Workers Cache isn't emulated locally, so the deploy isn't done until production
headers confirm it ([caching.md](./caching.md)). The shipped
`scripts/check-cache.sh` fails when a public route isn't served from cache
(`HIT` or `UPDATING`) or a per-user route is. Edit its two route lists — `/`
and `/dashboard` are placeholders — to the project's public and guarded routes.
