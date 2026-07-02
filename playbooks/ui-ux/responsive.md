## Responsive Design

> Mobile-first is non-negotiable: most booking customers arrive on a phone.
> Build the mobile layout first, then enhance upward.

### Breakpoints

Use the framework's standard scale (Tailwind shown). Design at the extremes first — 375px and 1440px — the middle usually follows.

| Token | Width | Treat as |
| ----- | ----- | -------- |
| (base) | < 640px | Phone — the default, not an afterthought |
| `sm` | ≥ 640px | Large phone / small tablet |
| `md` | ≥ 768px | Tablet — sidebars and multi-column may appear |
| `lg` | ≥ 1024px | Laptop — full desktop layout |
| `xl` / `2xl` | ≥ 1280/1536px | Wide — cap content width, don't stretch |

**Rule:** Breakpoints adapt *layout*, never *content*. If something is hidden on mobile, question whether it belongs on desktop.

---

### Touch Targets

| Standard | Minimum | Use |
| -------- | ------- | --- |
| WCAG 2.2 SC 2.5.8 (AA) | 24×24 CSS px (or 24px offset incl. spacing) | Legal floor — never go below |
| Apple HIG | 44×44 pt | **The practical target on mobile** |
| Material Design 3 | 48×48 dp | Android-heavy audiences |

- Visual size and hit area are separate: a 20px icon can carry a 44px tap zone (padding or pseudo-element)
- Adjacent targets (table row actions, icon groups) need ≥ 8px gap between hit areas
- Inputs and buttons on mobile: minimum height 44px, font-size ≥ 16px (below 16px, iOS zooms the viewport on focus)

---

### Layout Transformation Patterns

| Desktop pattern | Mobile transformation |
| --------------- | --------------------- |
| Sidebar navigation | Bottom nav (≤ 5 items) or hamburger drawer — bottom nav wins for frequent switching |
| Multi-column grid | Single column, priority order — most important content first, not left-most first |
| Data table | See dashboards.md: pinned first column + horizontal scroll, or card list |
| Hover interactions | Must have a tap equivalent — hover cannot be the only path to anything |
| Modal dialog | Full-screen sheet or bottom sheet |
| Inline filters row | Filter button → bottom sheet with Apply |

---

### Booking Flows on Mobile

- **One decision per screen** — service → time → details → pay beats a single long form
- **Sticky primary CTA** at the bottom, above the safe-area inset (`env(safe-area-inset-bottom)`)
- **Date/time pickers:** large tap targets, current selection always visible; never a native `<select>` for slot choice
- **Progress indicator** on multi-step flows — abandonment spikes when users can't see the end
- Correct keyboards via input attributes: `inputmode="numeric"` for phone/card fields, `type="email"`, `autocomplete` everywhere

---

### Rules

- **Mobile first in code, not just words** — base styles are the phone layout; media queries add complexity upward, never strip it downward.
- **44px tap targets on mobile.** 24px is the legal floor, not the goal.
- **Test at 375px width before calling any page done** — it's part of the definition-of-done review pass for UI work.
- **Never two sources of truth for one layout** — no separate `MobileNav` and `DesktopNav` holding duplicated links; one component, adaptive rendering.
- **Thumb zone matters:** primary actions in the bottom half of the screen, destructive actions out of it.
