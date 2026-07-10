# UI/UX Playbook — Index

> Design patterns, component architecture, and aesthetic preferences.
> For accessibility and performance, see `core/INDEX.md`.
>
> **For AI agents:** Read this INDEX, then ONLY the routed chapter for your task.
> The Design Taste section below always applies.

## Design Taste (always applies)

- **Dark mode first** — premium, modern feel. Light mode as secondary.
- **Typography** — Inter or Outfit from Google Fonts. Never browser defaults.
- **Color palette** — curated, harmonious, 60/30/10 (dominant/neutral/accent). No generic red/blue/green. HSL-tuned.
- **Glassmorphism** — frosted glass as an *accent* (nav, modals, feature cards) — never on every surface.
- **Micro-animations** — Framer Motion for transitions, hover, loading. Subtle, fast (150–300ms).
- **Spacing** — generous whitespace on marketing/public pages; controlled density on dashboards (see dashboards.md).
- **shadcn/ui** — as component base. Customize the tokens, never ship raw defaults.
- **Precedence** — this taste list and the project's `DESIGN.md` outrank any installed design skill's defaults (e.g. frontend-design's font bans). Skills execute the direction; they never choose it. See `recommended-skills.md`.

## Routing Table

| File | Covers | Read when you are... |
| ---- | ------ | -------------------- |
| [anti-ai-design.md](./anti-ai-design.md) | Slop patterns, DESIGN.md token lock, direction commitment | Starting ANY new UI, or the design "looks AI-generated" |
| [responsive.md](./responsive.md) | Mobile-first breakpoints, touch targets, adaptive layouts | Building any user-facing page |
| [dashboards.md](./dashboards.md) | Layout anatomy, data tables, filters, density, states | Building admin/dashboard UIs |

## Planned Chapters

- [ ] **components.md** — Component architecture, composition, prop design
- [ ] **animations.md** — Framer Motion patterns, page transitions
- [ ] **forms.md** — Form UX, validation feedback, multi-step flows
- [ ] **navigation.md** — Sidebar, breadcrumbs, tabs, mobile nav
- [ ] **anti-patterns.md** — Layout shift, poor contrast, missing feedback
