# Performance — Next.js Stack

> Implements the budgets and principles in `playbooks/core/performance.md`
> with Next.js 16 mechanics. Verify APIs against `node_modules/next/dist/docs/`.

## Partial Prerendering (PPR)

Static shell at build time, dynamic holes stream in per request:

```tsx
export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav><DashboardNav /></nav>

      <Suspense fallback={<KpiCardsSkeleton />}>
        <KpiCards />
      </Suspense>
      <Suspense fallback={<ScheduleTableSkeleton />}>
        <TodaySchedule />
      </Suspense>
    </div>
  )
}
```

## Caching — `use cache`

Replaces legacy `unstable_cache` and implicit caching. Requires enabling Cache Components in `next.config.ts` (opt-in while the directive is pre-stable — check the bundled docs for the current flag). Explicit and fine-grained:

```ts
async function getServicePricing() {
  "use cache"
  return prisma.pricingTier.findMany({ include: { serviceType: true } })
}
```

Every mutation that changes cached data invalidates by tag/path before returning.

## Images — `next/image`

| Scenario | Props |
| -------- | ----- |
| Hero / LCP image | `priority` — preloaded, never lazy |
| Below the fold | default lazy loading |
| All images | `width` + `height` (or static import) — CLS insurance |
| Responsive | `sizes="(max-width: 768px) 100vw, 50vw"` |

Config: `images.formats: ['image/avif', 'image/webp']` in `next.config.ts`.

## Fonts — `next/font`

```ts
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})
```

Self-hosted at build time, metrics-adjusted fallback (near-zero CLS). Variable fonts, ≤ 2 families, never `<link>` to Google Fonts.

## Lazy-Loading Heavy Widgets

```ts
import dynamic from "next/dynamic"

const RevenueChart = dynamic(
  () => import("@/components/dashboard/revenue-chart"),
  { loading: () => <ChartSkeleton />, ssr: false },
)
```

## Bundle Analysis

```bash
npx next experimental-analyze
```

Look for: server-only libraries (Prisma) leaking into client bundles, whole-library imports, chart libraries shipped eagerly. `next build` output shows first-load JS per route — flag anything > 170KB.
