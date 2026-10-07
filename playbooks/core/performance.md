## Performance Budgets

> **Source:** [web.dev — Core Web Vitals](https://web.dev/articles/vitals)
> Google ranks on the **75th percentile** of real-user data (CrUX).
> Always prioritise **field data** over lab/Lighthouse scores.
> Framework-specific implementation: `stacks/nextjs/performance.md` (PPR,
> `use cache`, next/image, next/font); vinext on Workers caches whole pages
> instead — `stacks/vinext-cloudflare/caching.md`.

---

### Core Web Vitals Thresholds

| Metric | Measures | Good | Needs Work | Poor |
| ------ | -------- | ---- | ---------- | ---- |
| **LCP** (Largest Contentful Paint) | Loading speed | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | Responsiveness | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | ≤ 0.1 | ≤ 0.25 | > 0.25 |

> **INP replaced FID in March 2024.** It measures ALL interactions, not just the first — if you pass INP, you're genuinely responsive.

---

### Resource Budgets

| Resource | Budget | Why |
| -------- | ------ | --- |
| **Total JS** | < 170 KB compressed per route | #1 cause of poor INP — main-thread blocking |
| **Total images** | < 1000 KB per page | Serve AVIF/WebP via the framework's image component |
| **Fonts** | ≤ 2 families, self-hosted, metrics-adjusted fallback | Third-party font requests cost LCP and CLS |
| **Third-party scripts** | Defer everything non-critical | Chat widgets, analytics → load after LCP |

---

### Principles (Any Framework)

- **The LCP element loads first.** Hero image/heading is preloaded, never lazy-loaded; everything below the fold is lazy.
- **Reserve space for everything dynamic.** Explicit dimensions on images, slots, and widgets — CLS is a layout discipline, not a tuning task.
- **Static shell, streamed data.** Serve the static frame instantly; stream personalised content into placeholders (skeletons match the real layout — see `ui-ux/dashboards.md`).
- **Heavy widgets load on interaction.** Date pickers, charts, maps: don't ship their JS until the user reaches for them.
- **Cache aggressively, invalidate on mutation.** Slow-changing data (pricing, settings) is served cached; every mutation invalidates its own cache keys.
- **Watch the client bundle.** Server-only libraries (ORM, secrets) must never reach the browser; import narrowly, never whole libraries for one function.

---

### Booking-Specific Rules

1. **Hero + booking CTA interactive within 2.5s** — the CTA is in the initial viewport.
2. **Slot containers have fixed dimensions** — the calendar must not jump as availability loads.
3. **Instant quote must feel instant** — < 200ms perceived: cache rate tables, show a calculating state, snap to the result.
4. **Skeletons everywhere** — every route ships a content-aware loading state, never a bare spinner.

---

### Enforcement

| Test | Tool | Frequency | Pass Criteria |
| ---- | ---- | --------- | ------------- |
| **Build size** | Framework build output | Every PR | No route > 170KB first-load JS |
| **Lighthouse** | Lighthouse CI | Every PR | Score ≥ 90 on public pages |
| **CWV (lab)** | DevTools performance panel | Weekly | LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 |
| **CWV (field)** | CrUX / PageSpeed Insights | Monthly | 75th percentile "Good" |
| **Bundle analysis** | Framework analyzer | Monthly | No unexpected library client-side |

Block merges that regress LCP or INP past thresholds — performance is a definition-of-done concern for public pages, not a launch-week scramble.
