# Gotchas — Next.js Stack

> Operational traps from real projects. Each cost a debugging session once —
> never again. Verified against current docs where a claim is versioned.

## Prisma

- **`prisma migrate dev` refuses non-interactive environments** (agents, CI, some shells) — and an `--allow-non-interactive` flag doesn't exist. The workflow that works: hand-write the SQL under `prisma/migrations/<timestamp>_<name>/migration.sql` → `prisma migrate deploy` → `prisma generate`. `migrate deploy` is the officially supported non-interactive command.
- **Schema edits need an explicit `prisma generate` before building.** `prebuild` runs `tsc` first, so a schema change surfaces as confusing stale-client type errors, not as "you forgot to generate."
- **A running dev server holds the old generated client** after a column rename — writes fail with `ColumnNotFound` even on unrelated fields (Prisma returns the full row). Restart dev after schema changes.
- **`Decimal` fields don't cross the Server→Client Component boundary.** Convert with `Number()` (or format server-side) before passing as props.

## Next.js

- **Stale `.next` after deleting or renaming a route:** the generated type validator still references the old file (`TS2307: Cannot find module`). Fix: `rm -rf .next`, rebuild. Applies to any route file move/delete.
- **Auth never goes in layouts** — they don't re-render on client-side navigation, so a lapsed session passes unchecked. DAL is the boundary (`rules/mistakes.md`, official Next.js auth guide).

## React Compiler

- **`setState` synchronously inside `useEffect` is rejected** (`set-state-in-effect` — cascading renders). For reading client-only values (cookies, `matchMedia`): `useSyncExternalStore`, which integrates synchronously with the render lifecycle.
- **Reading a ref during render is rejected.** For a stable per-mount value (e.g. a client idempotency key): lazy state init — `useState(() => crypto.randomUUID())`.
