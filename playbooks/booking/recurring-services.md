## Recurring Services (Plans & Visits)

> The machinery behind standing appointments and service plans — weekly cleans,
> bi-weekly lawn care, monthly maintenance. This is what SMEs outgrow
> Fresha/Acuity-class tools to get: their OWN recurring rules.

### The Two-Entity Model

Never model recurring work as one mutating booking. Split it:

| Entity | What it is | Carries |
| ------ | ---------- | ------- |
| **Plan** | The agreement | Frequency, anchor date, preferred day/time, locked pricing, preferred crew, status (ACTIVE/PAUSED/CANCELLED) |
| **Visit** | One occurrence | Concrete slot, its own status lifecycle, its own charge, the price inherited at generation |

The plan is the rule; visits are materialized instances — the same rule/materialization split as the availability engine (see [availability.md](./availability.md)). Every visit is individually reschedulable, skippable, and chargeable without touching its siblings.

### Modeling Frequency

Store an enum + anchor, not a cron string:

```
frequency: WEEKLY | BI_WEEKLY | EVERY_4_WEEKS | MONTHLY_BY_DATE
anchorDate: the first visit date — all occurrences derive from it
```

- **BI_WEEKLY means every 14 days from the anchor** — never "1st and 3rd week of the month", which drifts on 5-week months. Compute from the anchor, not the calendar shape.
- **Prefer EVERY_4_WEEKS over MONTHLY** for crew scheduling — fixed intervals keep the same weekday; "the 15th of each month" lands on different weekdays and fights slot generation.
- Full RFC 5545 RRULE strings earn their complexity only when a business genuinely needs irregular patterns ("last Friday of the month"). Default to the enum; note an ADR if you adopt RRULE.

### Visit Generation

Generate visits on a **rolling window** (4–8 weeks ahead), by a background job — the same cadence and discipline as slot generation:

```
For each ACTIVE plan:
  1. Compute occurrence dates from anchor + frequency within the window
  2. Skip dates that already have a visit (idempotency: unique on planId + occurrenceDate)
  3. For each new date: find the slot per plan preferences → create visit (price copied from plan)
  4. No slot available (holiday block, crew absence) → create visit as NEEDS_SCHEDULING and flag for review — NEVER silently skip an occurrence
```

- The unique constraint on `(planId, occurrenceDate)` is the safety net — the job can run twice without duplicating visits.
- **Bounded window always.** Generating "all future visits" is an anti-pattern (see [anti-patterns.md](./anti-patterns.md)) — unbounded rows, and every plan change would orphan hundreds of them.

### Skip / Pause / Resume / Cancel

Four different intents — never conflate them:

| Action | Scope | Effect | Fees |
| ------ | ----- | ------ | ---- |
| **Skip** | One visit | Visit → SKIPPED; plan and siblings untouched; occurrence is consumed, NOT rescheduled | Late-skip fee per cancellation policy |
| **Pause** | The plan | Plan → PAUSED; future *unstarted* visits released (slots freed); generation stops; optional auto-resume date | None typically |
| **Resume** | The plan | Plan → ACTIVE; generation restarts from resume date, same anchor rhythm | — |
| **Cancel** | The plan | Plan → CANCELLED (terminal); future visits cancelled + slots freed; past visits and their charges untouched | Per policy |

- Skip consumes the occurrence: a skipped weekly visit does NOT shift the next one. A client who wants the work moved reschedules the visit instead (see [rescheduling.md](./rescheduling.md)).
- Pause releases future slots so other clients can book them — this is why visits must be released, not just hidden.

### Mid-Plan Changes

Frequency, preferred time, scope, or address changes follow one rule: **past visits are history, future visits regenerate.**

```
1. Update the plan (new frequency/time/pricing)
2. Delete future visits still in SCHEDULED with no deposit/charge attached; free their slots
3. Regenerate from the effective date under the new rules
4. Visits already CONFIRMED with the client: flag for explicit re-confirmation, never silently move
5. Audit-log the change (old terms → new terms, who, why)
```

Price changes take effect from the next *generated* visit — already-generated visits keep the price they were created with (see [pricing.md](./pricing.md) on price locking). Notify before the first visit at the new price, not after the charge.

### Crew Consistency

Recurring clients expect the same crew — losing "their" crew is a common, avoidable churn trigger in home services:

- Store `preferredCrewId` on the plan; generation tries preferred crew first, any qualified crew second, NEEDS_SCHEDULING third
- A substitution is a **notification event** ("Maria is covering your visit Thursday"), never a silent swap
- Track the substitution rate per plan — a plan served by 4 different crews in 8 visits is churn waiting to happen; surface it on the admin dashboard

### Charging

Recurring plans charge **per visit, after delivery** — crew checks out → post-service off-session charge with key `charge:visit:{visitId}` (see [billing.md](./billing.md)). Never charge the whole plan upfront and never on a fixed calendar cycle detached from delivered work: skipped visit, no charge; extra visit, extra charge. Reconciliation stays trivial and disputes stay winnable.

### Rules

- **Plan = rule, visit = instance.** No entity called "recurring booking."
- **Anchor-date math only** — never "nth week of month" arithmetic.
- **Generation is idempotent and bounded** — unique on (planId, occurrenceDate), rolling window, background job.
- **An occurrence that can't be placed becomes NEEDS_SCHEDULING** — a human decides; the system never silently drops paid-for rhythm.
- **Skip ≠ pause ≠ cancel** — one visit, the plan's clock, the plan's life. Different states, different fees, different notifications.
- **Charge follows delivery**, visit by visit.
