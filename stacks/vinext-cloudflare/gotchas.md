# Gotchas — vinext + Cloudflare

> Traps no gate reports, from production work (Oct 2026). Each heading names
> the versions it was seen on; after an upgrade, re-verify the entry or delete
> it. Inherited traps: `stacks/nextjs/gotchas.md` (pnpm, App Router, React,
> Zod 4, Better Auth, shadcn). Caching traps: [caching.md](./caching.md).

## vinext 1.0

- **Dev can fall back from port 3000 to Vite's 5173 after a restart** — auth that trusts a specific host then fails. Pin `server: { port: 3000, strictPort: true }`.
- **Never import app modules into `cloudflare.config.ts` or `vite.config.ts`.** Node loads the config as native ESM (`.ts` extensions required), and a file that becomes a config dependency stops loading for app code ("Failed to load url"). Shared infrastructure constants live in the config and reach the Worker as text bindings.
- **Route handlers run in the React Server Components environment, where `react-dom/server` is blocked** — React Email's `render()` throws there. Pre-render templates at build time with placeholders and substitute at send time.

## Miniflare 5.x alpha (local dev)

- **The local Hyperdrive proxy crashes the dev server on a DNS blip** (`ENOTFOUND` on a socket with no `error` listener). Patch it with `pnpm patch` (`error` handlers on both proxy sockets, registered in `pnpm-workspace.yaml`); redo the patch when Miniflare updates and report upstream.
- **Bindings with `dev: { remote: true }`** (e.g. a shared R2 bucket) open a Cloudflare OAuth login on the first dev start.

## `cf` CLI beta + Workers Builds

- **Editing a Worker's variables or secrets in the dashboard marks it `last_deployed_from: dash`**, and the next non-interactive CI deploy aborts on any config difference. Change secrets only with `cf workers secrets update`. To recover: build, then run `pnpm exec cf deploy --prebuilt` in a real terminal and confirm the prompt (`vinext-cloudflare deploy` pipes cf's output, so cf aborts instead of asking).
- **`cf workers secrets update` creates and deploys a new Worker version** — treat it as a deploy.
- **`npx @vinext/cloudflare deploy` builds the app itself** — a separate Workers Builds build command builds twice.
- **R2 is enabled once per account** (a $0 subscription); its free tier is account-wide, so projects separate by bucket name.

## pnpm 11 and the Cloudflare prereleases

- **An explicit `minimumReleaseAge` fails installs that need a version under a day old** — and the Cloudflare toolchain ships near-daily, pinned exactly. The shipped `pnpm-workspace.yaml` exempts `cf`, `miniflare`, `workerd`, and `@cloudflare/*`: each publishes through npm trusted publishing with provenance, and `trustPolicy` still checks them (it has its own exclude list). `workerd` is on the list because `miniflare` pins an exact `workerd` released hours before it.
- **Anything else blocked** (Oct 2026: `@vitejs/plugin-rsc`, pinned by create-vinext-app hours after its release) waits out the day, or joins the list in a commit that names the version and why, and leaves it once that version is a day old. Never set `minimumReleaseAge: 0`.

## Drizzle 1.0 RC

- **The docs install the 1.0 RC while npm `latest` is 0.45** — pin the RC exactly. 1.0 takes `drizzle({ client })`; Cloudflare's Hyperdrive example still shows the 0.x `drizzle(client)`.
- **A bare `.desc()` emits `DESC NULLS LAST`** (drizzle-kit source) while `ORDER BY … DESC` means `NULLS FIRST`, so Postgres ignores the index — write `.desc().nullsFirst()` (see `core/database-indexing.md`).
- **`drizzle.config.ts` runs outside vinext**, which auto-loads `.env*` only for its own commands. `import "dotenv/config"` reads `.env` alone — load `.env.local` with `config({ path: ".env.local", quiet: true })`.
- **No native `tsvector` column** — full-text search uses a GIN expression index. The expression lives in one shared function that both the index and the queries call, so they match exactly.

## Better Auth 1.7 + Drizzle 1.0

- **The CLI's default Drizzle generator writes the old `relations()` API**, which 1.0 no longer exports. `templates/auth-config.ts` imports `drizzleAdapter` from `@better-auth/drizzle-adapter/relations-v2`, so the CLI writes `defineRelationsPart`; spread the result after the app's `defineRelations`. Install that package at `better-auth`'s exact version (they release in lockstep; pnpm refuses an undeclared import). The same adapter serves runtime: sign-up, verification, sign-in, sessions, and database rate limits ran on it against Drizzle 1.0 RC4.
- **Pass `import * as authSchema` to `drizzleAdapter`** — a hand-written table list missed the CLI's new `rateLimit` table and every auth request returned 500.
- **The CLI needs an `auth` export, but auth is built per request — and the CLI loads it in plain Node,** where `cloudflare:workers` and `next/*` don't resolve, so a config that imports `lib/auth.ts` fails. The options live in `lib/auth-config.ts` with runtime values as parameters; `auth-cli.ts` builds them on `drizzle.mock({ relations })` ([templates](./STACK.md#templates)). One options source, so the schema can't miss a plugin's table.
