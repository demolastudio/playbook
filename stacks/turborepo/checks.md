# Checks — Turborepo

Gates run through Turbo so caching applies, covering every app and package:

| Gate | Command |
| ---- | ------- |
| Typecheck + Lint + Tests | `npx turbo run typecheck lint test` |

Individual apps also satisfy their own stack profile's checks (e.g. `stacks/nextjs/checks.md` for `apps/web`).
