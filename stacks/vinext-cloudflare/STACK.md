# Stack — vinext + Cloudflare Workers + Drizzle + Better Auth (PRIMARY)

> vinext runs the Next.js App Router API on Vite and deploys to Workers. The
> installed packages are the source of truth for APIs — not this file, not
> training data: `node_modules/vinext/README.md`,
> `node_modules/@vinext/cloudflare/README.md`, `cf --help`. This profile keeps
> only decisions, their reasons, and the guardrails that enforce them.

## Inherits `stacks/nextjs`

Folder layout, conventions, the action pipeline (`define-action.ts`,
`errors.ts`, `logger.ts`, `proxy.ts`, `instrumentation.ts` templates), Zod
schemas, the oxlint gate, and the pnpm, App Router, React, Zod 4, Better Auth, and shadcn
sections of `stacks/nextjs/gotchas.md`. Where the two disagree, this profile
wins. The Prisma and `next` CLI sections and the Prisma templates never apply
here. vinext ships no `next` package, so `node_modules/next/dist/docs/` doesn't
exist — Next.js API semantics come from the Next.js docs site.

Layout differences: `db/` (schema, relations, generated auth schema) and
`drizzle/` (migrations) replace `prisma/`; `cloudflare.config.ts` (Worker,
bindings, secrets) and `vite.config.ts` replace `next.config.ts`. Use cases take
the request's client as their first argument: `createBooking(db, input)`.

## Decisions

| Decision | Why | Guardrail |
| -------- | --- | --------- |
| Postgres (Neon) through Hyperdrive, `pg` driver | Edge connection pooling; Hyperdrive connects to Neon's direct (non-`-pooler`) host | `templates/db.ts` |
| Drizzle, not Prisma | Smaller Worker bundle, no codegen step, native check constraints and partial indexes | Schema is code: `templates/schema.ts` |
| One DB client per request | Workers can't share I/O objects across requests | `getDb()` is the only way in |
| Writes and read-after-write use the uncached Hyperdrive config | Hyperdrive's ~60 s query cache is never invalidated by writes | `getDb()` = fresh; `getCachedReadDb()` is opt-in for read-only lists that tolerate a minute of staleness |
| Better Auth built per request: `createAuth(db)` | Its adapter needs this request's client | `templates/auth.ts`; the options live in `templates/auth-config.ts`, which the CLI can load |
| Bindings and secrets declared once in `cloudflare.config.ts` | One declaration feeds generated types (`.cloudflare/types`) and blocks deploy until each `bindings.secret()` is set — it replaces `lib/env.ts` | Deploy refuses; typecheck fails on a missing binding |
| Money in integer minor units + `CHECK` constraint | Floats round; the constraint is the last guard | `templates/schema.ts` |
| Side effects claim their idempotency key with `INSERT … ON CONFLICT DO NOTHING` | Race-free without locks — Hyperdrive has no advisory locks | `templates/idempotent-transaction.ts` |
| Background work through `waitUntil` | Responses return before email sends finish; failures land in logs | `templates/auth-config.ts` (`backgroundTasks`) |

## Prerelease Toolchain

vinext's default Cloudflare path runs on prerelease packages (Oct 2026: `cf` CLI
beta, Cloudflare Vite plugin v2 beta, Drizzle 1.0 RC, Miniflare alpha). Pin each
prerelease exactly (`pnpm add -E`) and upgrade one at a time through the update
PRs in `core/ci-cd.md`, so a regression has one suspect.

## Data Rules (Hyperdrive)

- No advisory locks, no session-level `SET` or `PREPARE` — Hyperdrive pools in transaction mode. Serialize with `SELECT … FOR UPDATE` in a short transaction, a conditional `UPDATE` with a checked row count, or a unique constraint.
- Transactions never span an external call (Stripe, email) — see `core/database.md`.

## Security

- Auth forms: every layer of `core/security.md`'s defense in depth. Turnstile, database rate limits on `cf-connecting-ip`, and breached-password rejection are wired in `templates/auth-config.ts`.
- Server Actions: `defineAction({ limit: perUserLimit })` keys the Workers Rate Limiting binding on action + user (`templates/rate-limit.ts`; declare `ACTION_LIMITER: bindings.rateLimit({ namespace: "1001", simple: { limit: 10, period: 60 } })` in `cloudflare.config.ts`). Approximate by design (per location, eventually consistent), so it stops abuse and never enforces business quotas; those are database queries.
- Stripe webhooks verify with `constructEventAsync` (the sync `constructEvent` throws on Workers): `templates/stripe-webhook.ts`.

## CI/CD

GitHub Actions runs the gates; Workers Builds deploys.

- **Gates:** the shipped `.github/workflows/gates.yml` ([checks.md](./checks.md)). GitHub holds no Cloudflare credentials — no gate needs one.
- **Deploy:** connect the repo in Workers Builds with production branch `main`, deploy command `npx @vinext/cloudflare deploy`, and no build command ([gotchas.md](./gotchas.md)). Workers Builds deploys every push to `main` without waiting for `gates`, so the branch ruleset requiring `gates` is what keeps a red commit out of production — on this stack it's mandatory.
- **Secrets:** only through `cf workers secrets update`, never the dashboard ([gotchas.md](./gotchas.md)).
- **After each deploy:** `bash scripts/check-cache.sh https://<production host>`.

## Templates

| Creating | Copy | To |
| -------- | ---- | -- |
| Action pipeline, headers (once) | the shared templates in [../nextjs/STACK.md](../nextjs/STACK.md#templates), plus [templates/rate-limit.ts](./templates/rate-limit.ts) | `lib/`, project root |
| Server Action | [templates/server-action.ts](./templates/server-action.ts) | `features/<name>/<name>-actions.ts` |
| Table + money + indexes | [templates/schema.ts](./templates/schema.ts), [templates/relations.ts](./templates/relations.ts) | `db/` |
| Request DB client | [templates/db.ts](./templates/db.ts) | `lib/db.ts` |
| Auth instance + session guard | [templates/auth.ts](./templates/auth.ts) | `lib/auth.ts` |
| Auth options, shared by the app and the schema CLI | [templates/auth-config.ts](./templates/auth-config.ts), [templates/auth-cli.ts](./templates/auth-cli.ts) | `lib/`, project root |
| Charge or other side effect, exactly once | [templates/idempotent-transaction.ts](./templates/idempotent-transaction.ts) | `features/payment/charge-booking-once.ts` |
| Stripe webhook route handler | [templates/stripe-webhook.ts](./templates/stripe-webhook.ts) | `app/api/webhooks/stripe/route.ts` |

Templates typecheck against the pinned versions; when an upgrade breaks one, fix the template in the same PR.

## More

- Page caching on Workers Cache: [caching.md](./caching.md)
- Traps no tool reports: [gotchas.md](./gotchas.md)
- Definition-of-done commands: [checks.md](./checks.md)
