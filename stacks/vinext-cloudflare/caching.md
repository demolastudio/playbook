# Caching — vinext + Workers Cache

> Verified on vinext 1.0 / `@vinext/cloudflare` 1.0. Adapter setup lives in
> `node_modules/@vinext/cloudflare/README.md`; this file keeps the decisions
> and the traps.

## Decisions

- **Page cache = Workers Cache** (`workersCacheCdnAdapter()` + `createWorkersCacheConfig()`): any plan, no extra cost, no KV for pages alone.
- **`revalidate` lives once, on the shared layout** — the lowest value across a route's segments wins, so per-page copies only drift.
- **Every layout whose pages redirect or show per-user data exports `dynamic = "force-dynamic"`** (member, admin, auth). Without it the shared cache stage follows the redirect internally while re-rendering the original URL: `redirect()` loops and the page returns 500 in production while dev works. It also keeps per-user pages out of a cache whose key ignores cookies. Valid only without `cacheComponents` (Next.js 16 removes `dynamic` when it is on).
- **Pages purged on write render from `getDb()`** (uncached Hyperdrive). The cached config feeds pre-write rows into the re-render, and that stale page then stays cached for the whole revalidate window.

## What Makes a Page Uncacheable

| Cause | Fix |
| ----- | --- |
| Dynamic route (`[slug]`) without `generateStaticParams` | Export it; return `[]` to render on first visit, then cache |
| Reading `searchParams` | Put variants in the path (`/trending`, `/communities/[slug]/trending`), never `?sort=` |
| `cookies()` / `headers()` | Expected on guarded pages — they are `force-dynamic` anyway |

On cacheable pages vinext waits for the whole render to read cache settings, so `loading.tsx` and `<Suspense>` don't stream the first document load there.

## Verify After Every Deploy

The build route table (`?` / `ƒ`) is static analysis only, and Workers Cache isn't emulated locally — production headers are the only truth. The browser-facing `Cache-Control` is always `private, max-age=0, must-revalidate` (set deliberately by the gateway); the edge result is `X-Vinext-Cache` (`HIT`, `UPDATING` = served stale while revalidating, `MISS`, `EXPIRED`, `BYPASS`, `DYNAMIC`). The post-deploy check is in [checks.md](./checks.md).
