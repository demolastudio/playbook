## Dashboard RBAC

> Role machinery for admin dashboards. Auth setup and the permission map
> live in `core/auth.md` — this chapter is how roles shape the dashboard.

### The SME Role Set

Resist inventing roles. Almost every SME booking platform needs exactly three:

| Role | Who | Scope |
| ---- | --- | ----- |
| **Owner** | The business owner | Everything: settings, pricing, refunds, staff, exports |
| **Manager** | Front desk / ops lead | Day-to-day: bookings, clients, schedules — not pricing, payouts, or staff accounts |
| **Staff** | Crew members | Own schedule + assigned visits only; check-in/check-out; no client financials |

More roles come from a real business need with a name attached — never speculatively (an ADR when it happens).

### Enforcement Layers

| Layer | What it does | Security? |
| ----- | ------------ | --------- |
| Middleware | Redirects non-authed users away from `/dashboard` | No — convenience |
| Layout/page | Hides nav sections the role can't use | No — cosmetic |
| Server action / DAL | `requirePermission()` on every read and mutation | **Yes — the only layer that counts** |
| Query scope | Staff queries filtered to own assignments in the DAL | **Yes** — role + row scope together (`core/security.md` BOLA) |

Hiding a button is UX; the action behind it re-checks regardless. Staff don't get a 403 page for the payouts screen — they never see the link, AND the query would refuse them.

### Role-Scoped Data, Not Just Role-Scoped Pages

The same dashboard page renders differently per role from the same components: Owner's schedule shows all crews + revenue per visit; Staff's shows their own visits, no amounts. The **DAL decides what data comes back** based on the session role — components never filter sensitive fields client-side, because data sent to the browser is data leaked.

### Role Changes

- Role change → invalidate the user's sessions (force re-auth), audit-log who changed whom from what to what (`core/auth.md`)
- Offboarding staff: deactivate, never delete — their name stays on historical visits and audit entries

### Rules

- **Three roles until a named business need says otherwise.**
- **The DAL is the only enforcement layer that counts** — middleware and hidden nav are convenience.
- **Scope rows, not just routes** — staff see their slice of the same tables.
- **Sensitive fields are excluded server-side**, never hidden client-side.
