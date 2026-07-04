## Anti-Patterns — Booking Platforms

> Booking-specific anti-patterns. For general anti-patterns, see `core/anti-patterns.md`.

---

### 1. Check-Then-Book Race Condition (Double Booking)

The #1 cause of double bookings. Two requests read the same "available" slot before either writes.

```typescript
// ❌ DON'T: Two separate operations — race condition window
const slot = await prisma.slot.findFirst({
  where: { time: selectedTime, status: "AVAILABLE" },
})
if (slot) {
  await prisma.slot.update({
    where: { id: slot.id },
    data: { status: "BOOKED" },
  })
}

// ✅ DO: Atomic conditional update — no race window
const result = await prisma.$executeRaw`
  UPDATE slot SET status = 'BOOKED', client_id = ${clientId}
  WHERE time = ${selectedTime} AND status = 'AVAILABLE'
`
if (result === 0) throw new Error("Slot no longer available")
```

---

### 2. Timezone Math for Cancellation Deadlines

```typescript
// ❌ DON'T: Compare dates without timezone context
const isLate = differenceInHours(booking.startTime, new Date()) < 24

// ✅ DO: All comparisons in the business timezone (date-fns-tz v3 — formerly utcToZonedTime)
import { toZonedTime } from "date-fns-tz"
const BUSINESS_TZ = env.BUSINESS_TIMEZONE
const now = toZonedTime(new Date(), BUSINESS_TZ)
const start = toZonedTime(booking.startTime, BUSINESS_TZ)
const isLate = differenceInHours(start, now) < 24
```

**Real bug:** Cancellation fee wrongly applied at 11pm CT because `new Date()` returned UTC midnight.

---

### 3. Trusting Client-Side Booking Payment

```typescript
// ❌ DON'T: Mark booking as paid from frontend callback
const handleBooking = async (formData: FormData) => {
  await prisma.booking.update({ where: { id }, data: { status: "PAID" } })
}

// ✅ DO: Only mark as paid from Stripe webhook (server-to-server)
// The webhook handler is the ONLY code that sets status to PAID
```

---

### 4. Not Testing Concurrent Slot Access

```
❌ DON'T: Only write sequential unit tests
   test("creates booking") → passes with 1 request
   → deploys to production → fails with 50 concurrent requests

✅ DO: Write a concurrency test
   test("prevents double-booking under concurrent load")
   → Fire 10 simultaneous requests for the same slot
   → Assert exactly 1 succeeds and 9 fail with "slot unavailable"
```

**Rule:** If a function touches shared state (slots, crew capacity, payment status), it needs a concurrency test.

---

### 5. Unbounded Visit Generation

```
❌ DON'T: Generate all visits for the plan's lifetime on creation
   Weekly plan → 52+ rows/year, orphaned en masse on every plan change

✅ DO: Rolling window (4–8 weeks) via background job,
   unique constraint on (planId, occurrenceDate) so re-runs are idempotent
```

See `booking/recurring-services.md`.

---

### 6. Floating-Point Money

```typescript
// ❌ DON'T: price: 156.82  →  0.1 + 0.2 === 0.30000000000000004
// ✅ DO: amountCents: 15682 (integer minor units) + explicit currency
```

Round once, at the final total. See `booking/pricing.md`.

---

### 7. Recomputing Price from Current Rates

```
❌ DON'T: charge = quote(service, attrs, ...) at charge time
   Rates changed since booking → client charged more than they agreed to

✅ DO: copy the line-item breakdown onto the booking at creation;
   charge reads the stored snapshot, never the live rate table
```

---

### 8. Reminders Without Idempotency

```
❌ DON'T: cron finds tomorrow's visits → sends reminders
   Cron reruns after a crash → every client reminded twice

✅ DO: email_log guard per side effect
   key: reminder:24hr:{visitId} — check, send, record (see core/idempotency.md)
```
