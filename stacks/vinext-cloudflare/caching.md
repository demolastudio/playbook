# Caching — vinext + Workers Cache

> Traps verified in production on vinext 1.0 / `@vinext/cloudflare` 1.0; re-checked against the 1.4.3 / 1.3.3 source, docs, and a fresh scaffold (Nov 2026). Adapter setup lives in
> `node_modules/@vinext/cloudflare/README.md`; this file keeps the decisions
> and the traps.

## Decisions

- **Page cache = Workers Cache** (`workersCacheCdnAdapter()` + `createWorkersCacheConfig()`): any plan, no extra cost, no KV for pages alone.
- **`revalidate` lives once, on the shared layout** — the lowest value across a route's segments wins, so per-page copies only drift.
- **Every layout whose pages redirect or show per-user data exports `dynamic = "force-dynamic"`** (member, admin, auth). It keeps per-user pages out of a cache whose key ignores cookies, and `revalidatePath()` skips the edge purge for paths only `force-dynamic` routes serve. (The `redirect()` loop it also prevented on 1.0 was fixed in `@vinext/cloudflare` 1.2.0.) Valid only without `cacheComponents` (Next.js 16 removes `dynamic` when it is on).
- **Size `revalidate` for a failed purge.** Workers Cache purges use Cloudflare's Free-tier purge limits, shared by every Worker in the account. A failed purge is only logged: the action succeeds and the page stays stale until it expires.
- **Pages purged on write render from `getDb()`** (uncached Hyperdrive). The cached config feeds pre-write rows into the re-render, and that stale page then stays cached for the whole revalidate window.

## What Makes a Page Uncacheable

| Cause | Fix |
| ----- | --- |
| Dynamic route (`[slug]`) without `generateStaticParams` | Export it; return `[]` to render on first visit, then cache |
| Reading `searchParams` | Put variants in the path (`/trending`, `/communities/[slug]/trending`), never `?sort=` |
| `cookies()` / `headers()` | Expected on guarded pages — they are `force-dynamic` anyway |

## Verify After Every Deploy

The build's route table (`◐` ISR, `λ` dynamic) is static analysis only, and Workers Cache isn't emulated locally — production headers are the only truth. The browser-facing `Cache-Control` is always `private, max-age=0, must-revalidate` (set deliberately by the gateway); the edge result is `X-Vinext-Cache` (`HIT`, `UPDATING` = served stale while revalidating, `MISS`, `EXPIRED`, `BYPASS`, `DYNAMIC`). The post-deploy check is in [checks.md](./checks.md).
