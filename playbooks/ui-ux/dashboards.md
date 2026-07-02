## Dashboards

> Admin and operational dashboards — where density, hierarchy, and state
> handling matter more than whitespace. Dark mode first (see INDEX taste).

### The 5-Second Rule

A user landing on the dashboard must answer "is everything okay, and what needs my attention?" within 5 seconds. Everything else is drill-down.

| Zone | Content | Priority |
| ---- | ------- | -------- |
| Page header | Title, global date-range filter, primary action | Orientation |
| KPI row | 3–5 metrics max, each with trend vs. previous period | Answer "is everything okay?" |
| Attention area | Items needing action (pending bookings, failed payments, disputes) | Answer "what needs me?" |
| Main content | Tables, charts, feeds | Drill-down |

A number without comparison is noise: always show delta ("↑ 12% vs last week") or target.

---

### Data Tables

The core of every admin dashboard. Get these right:

| Concern | Rule |
| ------- | ---- |
| Alignment | Numbers/currency right-aligned (tabular figures), text left, dates consistent one format |
| Density | Offer compact / comfortable as a user setting — analysts and casual users need different row heights |
| Header | Sticky on scroll; sortable columns show direction indicator |
| Row actions | Max 2 inline (view + primary verb); the rest in a `⋯` menu; whole row clickable to detail |
| Bulk actions | Checkbox column + action bar that appears on selection |
| Pagination | Server-side pagination for > 100 rows; virtualize only when pagination genuinely fails the workflow |
| Mobile | Pin the identifying column, horizontal-scroll the rest — or collapse to cards when < 5 key fields |
| Truncation | Truncate with tooltip, never wrap IDs; emails/names get `max-w` + ellipsis |

**Status columns:** colored dot or subtle badge + text label. Never color alone (accessibility), never a rainbow — statuses use the semantic palette only.

---

### Filters and State

- **URL is the filter state.** Every filter, sort, page, and date range lives in searchParams — shareable, bookmarkable, survives refresh.
- Applied filters render as removable chips above the table
- Date-range picker with presets first (Today, 7d, 30d, MTD, Custom) — custom range is the rare case
- Debounce text search (~300ms), fire selects immediately

---

### The Four States

Every data view ships all four — this is part of definition-of-done:

| State | Requirement |
| ----- | ----------- |
| Loading | Skeleton matching the real layout — never a lone spinner, never layout shift on load |
| Empty (no data yet) | One line of guidance + CTA to create the first item — not just "No results" |
| Empty (filtered to nothing) | "No matches" + one-click clear filters |
| Error | What failed + retry button; log to monitoring (see `core/monitoring.md`) |

---

### Charts

- Default to the boring correct choice: line for trends, bar for comparison, big number for single KPIs. Pie only for 2–3 part compositions.
- Max ~2 chart types per view — a dashboard is not a chart gallery
- Charts answer a question; put the question in the title ("Bookings per week", not "Bookings")
- Tooltips on hover/tap for precision; axis labels abbreviated (12k, not 12,000)
- In dark mode: desaturated fills, one highlighted series; gridlines barely visible

---

### Rules

- **Density is a feature on dashboards** — generous whitespace is for marketing pages; operators want information per screen. Controlled density ≠ clutter: hierarchy does the work.
- **KPI row: 5 metrics max.** More than 5 means no decision was made about what matters.
- **Every list view ships loading + both empty states + error.** No exceptions.
- **URL = state.** If a filtered view can't be shared by copying the URL, it's built wrong.
- **Real data shapes the design** — test with 0, 1, and 10,000 rows, longest names, largest numbers (see `rules/mistakes.md` on placeholder content).
- **Auto-refresh politely:** poll or stream updates into a "3 new bookings" affordance — never yank the table out from under a reading user.
