## Testing

> Integration first. Tests enter at a feature's public seam and run against a
> real Postgres; Playwright covers only the money journeys. There is no unit
> layer and no mocks of your own modules. Which changes need which test:
> `rules/definition-of-done.md` gate 3.

### The Three Layers

| Layer | What | Runs |
| ----- | ---- | ---- |
| **Static** | `tsc` + oxlint (types, deprecations, import direction) | Every save and every PR |
| **Integration** (most tests) | A feature's use case (`create-booking.ts`) against real Postgres; Stripe, email, and the clock faked at the boundary | Every PR |
| **E2E** | 3–8 Playwright specs, one per money journey | Preview deploy or local build |

A test of an internal helper breaks on every refactor and proves nothing a seam test misses. The one exception is pure money math (rounding, tax, fees, refunds): table-driven tests at the pricing function's own seam, expected values worked out by hand.

| Priority | What to Test | Why | Test |
| -------- | ------------ | --- | ---- |
| **1 (Critical)** | State transitions | Prevents impossible states | Integration |
| **2 (Critical)** | Pricing & billing calculations | One bug = wrong charges on every booking | Pricing-seam table |
| **3 (High)** | Scheduling / slot generation | Wrong dates = missed appointments | Integration |
| **4 (High)** | Idempotency (charges, emails) | Prevents duplicate charges and notifications | Integration |
| **5 (High)** | Concurrency (double-booking) | Race conditions only surface under load | Integration, parallel requests |
| **6 (Medium)** | Cancellation policy logic | Fee miscalculations cause disputes | Integration |
| **7 (Medium)** | Capacity checks | Prevents overbooking | Integration |
| **8 (Medium)** | Book → pay → confirm | The journey only a browser sees | E2E |

---

### Writing Tests

#### Test at Seams

A **seam** is the public boundary you test at — a feature's use case, never its internals. Test **what** it does ("cancellation 12 hours before incurs a 100% fee"), not **how** (which query it ran). Decide the seams under test before writing tests — ideally during `/spec`. Never write **tautological tests**: expected values come from a known-good literal or a worked example, never from recomputing them the way the code does. Schema rules are tested through the use case that parses the input, not separately.

#### The Red → Green Loop

When building test-first, work in **vertical slices**: one failing test → the minimum implementation that passes it → the next test. Never write all tests up front. Watch the test fail before making it pass; a test that never went red proves nothing. Refactoring is a separate step after green.

#### Use Factories, Not Fixtures

```
✅  Factory: createBooking({ status: "CONFIRMED", startTime: tomorrow() })
❌  Fixture: static booking_123.json that depends on a specific database state
```

Factories produce fresh, isolated data per test; fixtures create hidden dependencies between tests.

---

### Integration Test Setup

- **Runner:** Vitest in plain Node. The Workers test pool adds little: it was renamed to `@cloudflare/vitest-plugin` (Oct 2026: needs Vitest 4), and no local runtime reproduces Hyperdrive's pooling.
- **Seam:** use cases take the database client as their first argument (`createBooking(db, input)` on vinext); a test builds its own client from `DATABASE_URL`. With Prisma, point `DATABASE_URL` at the test database.
- **Database:** a Postgres service container in CI (`stacks/nextjs/ci-cd.md`), Docker Postgres locally, migrations applied first. `TRUNCATE … RESTART IDENTITY CASCADE` in `beforeEach`, with `fileParallelism: false`. PGlite suits quick local runs but holds one connection, so it cannot run concurrency tests.
- **Signed-in users:** Better Auth's `testUtils()` plugin, in a test-only auth instance.
- **Location:** `create-booking.test.ts` sits next to `create-booking.ts`.

#### Sandbox Checks

When a fake cannot prove an integration — Stripe webhook signatures and payloads, email delivery, database behavior on Neon — run it against the provider's sandbox before calling the work done: Stripe test mode (`stripe listen --forward-to` + `stripe trigger`), Resend's test addresses, a Neon branch. Test-mode keys only; report the sandbox run as evidence.

#### Concurrency Tests

Race conditions can't be reliably reproduced with single-threaded tests. You need parallel execution:

```
1. Seed a slot with capacity = 1
2. Fire N concurrent booking requests for the same slot
3. Assert: exactly 1 succeeds, N-1 fail with "slot unavailable"
4. Assert: the database has exactly 1 booking for that slot
```

---

### E2E Testing Patterns

Test the complete user journey through a real browser:

| Flow | What to Test |
| ---- | ------------ |
| **Booking creation** | Search → select slot → fill form → submit → see confirmation |
| **Cancellation** | View booking → cancel → see fee warning → confirm → booking status changes |
| **Payment flow** | Add payment method → charge → verify receipt email |
| **Edge cases** | Double-click submit, back button during checkout, expired session |

**Rules for E2E tests:**
- Keep them focused on **critical revenue paths** — don't E2E test every UI element
- Use unique, descriptive IDs on interactive elements for reliable selectors
- Seed test data at the start of each test — never depend on data from a previous test

**E2E baseline (Playwright):**
- Specs live in `e2e/`. A **setup project** signs in once and saves `storageState`; specs start authenticated
- A **phone-device project** runs the same specs — the 375px responsive gate, automated
- `workers: 1` when specs share an account or a rate limit
- **Global teardown** deletes test data, and refuses to run unless the database URL is the development database
- Assert on **server-confirmed state** (the persisted value after reload, the server's response) — never on optimistic UI

---

### Edge Cases Every Booking System Must Test

| Category | Edge Case |
| -------- | --------- |
| **Time** | Leap year (Feb 29), DST transition, midnight boundary, January 1 |
| **Concurrency** | Last slot booked simultaneously by 2 users |
| **Payment** | Card declined, network timeout during charge, webhook arrives before redirect |
| **User behavior** | Double-click submit, back button mid-checkout, session expires during booking |
| **State** | Cancel a completed booking (should be rejected), rebook a cancelled slot |
| **Capacity** | Book the last seat, book seat N+1 (should fail), waitlist overflow |
| **Data** | Empty strings, max-length inputs, Unicode characters in names, SQL injection in notes |

---

### Query Budget Testing

Add query counters to your test suite. Fail the build if a single request fires more than N database queries:

```
Dashboard page budget: max 5 queries
Booking creation budget: max 3 queries
API listing endpoint budget: max 2 queries
```

This catches N+1 regressions before they reach production (see `core/database-indexing.md`).

---

### Test Environment Setup

| Concern | Pattern |
| ------- | ------- |
| **Database** | Separate test database. Reset between suites. Use same migrations as production. |
| **External services** | Fake payment providers, email APIs, calendar sync at the boundary in CI; their sandboxes when you need proof (above). Never live services. |
| **Time** | Freeze or mock the current time for deterministic date-based tests. |
| **Secrets** | Use test-specific env vars. Never share production credentials with tests. |
| **Isolation** | Each test gets fresh data. No test depends on another test's side effects. |

---

### Rules

- **Prioritize by business impact.** Pricing bugs and double-bookings cost real money. Test those first.
- **Factories over fixtures.** Generate test data dynamically for isolation and readability.
- **Integration first, no unit layer.** Real database, real modules; fakes only at system boundaries.
- **Test concurrency with parallel requests.** Single-threaded tests can't find race conditions.
- **Freeze time in date-sensitive tests.** Non-deterministic tests are worse than no tests.
- **Set query budgets.** Catch N+1 regressions before they reach production.
- **Mock at system boundaries only** (payment APIs, email, time, randomness) — never your own modules or internal collaborators, and never real production services.
- **Edge case tests are mandatory** for time, concurrency, payment, and user behavior boundaries.
