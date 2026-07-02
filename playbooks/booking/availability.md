## Availability & Scheduling

### The Core Problem

A booking system's most fundamental job: **determine what's available, let users claim it, and prevent conflicts.** Everything else — payments, notifications, cancellations — orbits around this.

---

### Availability Models

Different booking types need different data models. Choose first — it shapes your schema, queries, and conflict resolution:

| Model | Example | Key Constraint |
| ----- | ------- | -------------- |
| **1:1 Slot** | Hair appointment, dental visit | One resource, one customer per time window |
| **Capacity-based** | Yoga class (20 seats), restaurant table | N customers per slot until max capacity reached |
| **Duration-based** | Cleaning service (2–4 hours) | Customer picks a start time, system blocks the required duration |
| **Resource pool** | "Any available cleaner" | System assigns from a pool based on availability, skills, and location |

---

### Slot Generation

#### Approach 1: Materialized (Generate-and-Store)

Pre-generate concrete time windows and store them in a `slots` table:

| Pros | Cons |
| ---- | ---- |
| Fast queries — `SELECT WHERE status = 'AVAILABLE'` | Storage cost for future slots |
| Easy to lock individual slots (see `booking/concurrency.md`) | Must regenerate when schedule rules change |
| Simple capacity tracking per slot | Needs a background job for rolling generation |
| Overrides are just row updates | Stale if generation job fails |

**Best for:** Fixed schedules, recurring availability, capacity-based models, high query volume.

#### Approach 2: Virtual (Calculate-on-the-Fly)

Compute available slots at query time: `schedule_rules - existing_bookings = available`:

| Pros | Cons |
| ---- | ---- |
| No storage for empty slots | Slower under load — computed every request |
| Schedule changes apply instantly | Complex query logic, harder to optimize |
| No regeneration jobs needed | Buffer time and overrides add query complexity |

**Best for:** Simple 1:1 scheduling, low volume, frequently-changing rules.

#### Approach 3: Hybrid (Recommended)

Store recurring patterns as **rules**, but materialize slots for a **rolling window** (e.g., next 3–6 months):

1. **Rules table** stores the patterns ("Mon–Fri 9–5", "Every Tuesday 10 AM")
2. **Exceptions table** stores overrides ("Closed Dec 25", "Staff sick June 5")
3. **Background job** expands rules into concrete slots, subtracting exceptions
4. **Slots table** holds the materialized result — fast to query, easy to lock

When rules change, re-expand the affected date range. Treat the slots table as a **cache of the rules**, not the source of truth.

---

### The Data Model: Pattern + Exception

The core schema for any availability engine:

| Table | Purpose | Example Row |
| ----- | ------- | ----------- |
| **availability_rules** | Recurring schedule patterns | `resource_id, day_of_week: MON, start: 09:00, end: 17:00, timezone: America/Chicago` |
| **availability_exceptions** | One-off overrides (blocks or additions) | `resource_id, date: 2026-12-25, type: BLOCK, reason: "Holiday"` |
| **slots** | Materialized bookable windows | `resource_id, start_time (UTC), end_time (UTC), status: AVAILABLE, capacity: 1` |
| **bookings** | Confirmed reservations | `slot_id, client_id, status: CONFIRMED` |

**Resolution order:** Exception > Rule. If an exception says "blocked", the rule is overridden regardless.

---

### Slot Generation Algorithm

```
For each day in the generation window:
  1. Get the resource's rules for that day of week
  2. Check for exceptions on that date
     ├── BLOCK exception → skip the day (or part of it)
     └── EXTEND exception → add extra hours
  3. Divide the working hours into slots based on service duration + buffer
  4. For each candidate slot:
     a. Check it doesn't overlap existing bookings
     b. Check buffer time doesn't collide
     c. Insert into slots table if valid
```

**Generation frequency:** Run daily for the next N months. Also trigger on-demand when rules or exceptions change.

---

### Buffer Time

**Never schedule back-to-back without accounting for prep, travel, or cleanup.**

| Buffer Type | Example | Impact |
| ----------- | ------- | ------ |
| **Pre-buffer** | Setup time, travel to client | Blocks time *before* the booking |
| **Post-buffer** | Cleanup, documentation, travel to next job | Blocks time *after* the booking |
| **Both** | Medical appointments (sanitize before and after) | Blocks in both directions |

#### Implementation Approaches

**Extended Duration (simpler):** Treat buffer as part of the total blocked time. Customer sees 10:00–11:00 (60 min service); system blocks 10:00–11:15; next available slot starts 11:15.

**Non-Bookable Block (more flexible):** Create a separate "buffer" record adjacent to each booking. More complex but allows different buffer types and durations.

#### Rules

- Store buffer durations on the **service type**, not hardcoded in slot generation logic
- Always check against the **expanded window** (booking + buffer) when computing availability
- Buffer at the **start of the day** is usually unnecessary — only between consecutive bookings and after the last one
- For **mobile services** (field technicians, cleaners), buffer includes travel time — which varies by location. Consider integrating with a mapping API for dynamic travel estimates.

---

### Capacity Management

For capacity-based slots (classes, group events, tables):

| Concept | How It Works |
| ------- | ------------ |
| **Tracking** | Each slot has a `max_capacity` and `current_count`. Booking increments count, cancellation decrements. |
| **Enforcement** | Use an atomic operation (DB constraint or transaction) to prevent count exceeding max. Never do read-then-write — race condition (see `booking/concurrency.md`). |
| **Display** | Show "3 spots left" to create urgency, or just "Available" / "Full" for simplicity. |

#### Overbooking (When Appropriate)

Some industries intentionally overbook based on historical no-show rates. Example: 10% historical no-show rate on capacity 20 → allow 22 bookings (110%), expected attendance ≈ 20.

- **Only use for specific business types** where no-shows are predictable (fitness classes, restaurants)
- **Have a clear overflow policy** — what happens if everyone shows up? (Waitlist priority, voucher, reschedule)
- **Track accuracy** — if your model over-predicts no-shows, dial it back

#### Waitlists

When a slot hits capacity:

1. Offer to join a waitlist (store position + timestamp)
2. On cancellation → notify the **first waitlisted person** with a **time-limited offer** (e.g., 30 min to confirm)
3. If they don't respond → auto-advance to the next person
4. Auto-expire all waitlist entries after the slot's date passes

**Key:** The waitlist offer must have a TTL. Without it, a customer who's asleep holds up the entire queue.

---

### Schedule Rules & Overrides

A resource's availability is built from layers, applied in priority order:

| Layer | What It Defines | Priority |
| ----- | --------------- | -------- |
| **Business hours** | Default operating hours (Mon–Fri 9–5) | Lowest — base layer |
| **Resource schedule** | This cleaner works Tue/Thu only | Overrides business hours |
| **Recurring blocks** | Lunch break 12–1 PM daily, team meeting Fri 3 PM | Removes windows from schedule |
| **One-off overrides** | Closed Dec 25, staff sick on June 5, extra hours on Saturday | **Highest priority** — overrides everything |

**Resolution:** When generating slots, apply layers top-down. A one-off block always wins over a recurring rule.

**Manual overrides must propagate immediately:**
- Staff calls in sick → block all their slots for that day
- Notify affected customers with rebooking options
- Log the override in the audit trail (see `core/audit-trails.md`)

---

### Availability Search Optimization

The "what's open?" query is the most-hit endpoint. It must be fast.

- **Materialized slots:** index on `(resource_id, status, start_time)`; query by resource + status + time range only
- **Resource pool ("any available"):** filter resources by criteria → query each resource's slots in range → merge, dedupe, sort, paginate

#### Performance Strategies

| Strategy | When |
| -------- | ---- |
| **Cache next 7 days** | Invalidate on booking/cancellation. Covers 90%+ of queries. |
| **Paginate results** | Never return all slots for a month — return a week at a time. |
| **Pre-aggregate** | For high-traffic public pages, pre-compute "next available date" per resource. |

---

### Rules

- **Slot generation is a background concern** — never generate slots synchronously during a user request.
- **Buffer time is non-negotiable** — without it, providers burn out and quality drops. Store buffers on the service type.
- **Overrides always win** — a one-off block overrides any recurring rule, no exceptions.
- **The availability query must be fast** — it's the most-hit endpoint. Cache aggressively, paginate results.
- **Capacity = 0 is not "unavailable"** — a full slot can still have a waitlist. Design for it.
- **Calendar sync and no-shows have their own chapters** — [calendar-sync.md](./calendar-sync.md), [rescheduling.md](./rescheduling.md).
- **Customer sees service duration, system blocks service + buffer** — never expose internal scheduling constraints to the customer.
- **Minimum time unit** — pick 5, 10, or 15 minute granularity early. Mixing granularities creates micro-gaps.
