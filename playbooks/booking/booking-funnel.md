## Booking Funnel

> The public multi-step flow: quote → schedule → details → pay.
> Conversion machinery — every rule here exists because a step leaked bookings.

### The Canonical Steps

```
1. QUOTE     service + attributes + add-ons → itemized price (pricing.md)
2. SCHEDULE  pick slot → Hold placed (concurrency.md soft lock)
3. DETAILS   contact + address + notes — AFTER they're invested, not before
4. PAY       deposit via on-session PaymentIntent, card saved for balance
```

Order is deliberate: price before calendar (no one picks a time for an unknown price), contact details after slot selection (sunk cost carries them through the form), payment last. One decision per screen on mobile (see `ui-ux/responsive.md`).

### Draft State Lives Server-Side

Create a **draft booking row** at step 1 (id in cookie/URL param, no PII yet):

- Survives refresh, tab close, device switch via emailed link
- Each step PATCHes the draft; the server owns validation and the running quote
- Drafts expire (48–72h) and are purged; a draft is not a booking — it holds no slot until step 2

### The Hold Window

- The Hold starts at slot selection with a TTL that covers the remaining steps (5–10 min), renewed on step transitions
- **Show the countdown** ("we're holding 2:00 Thursday for 8 more minutes") — urgency is honest here
- Hold expires mid-checkout → re-check the slot at pay; taken → offer nearest alternatives immediately, keep everything else filled in
- Payment success writes the hard booking in the same transaction that consumes the Hold (concurrency.md two-phase pattern)

### Revalidate Everything at Pay

The pay step re-runs server-side, against stored state, regardless of what the UI shows:

- Quote total from the draft's stored breakdown (never the client's number — anti-pattern 3)
- Promo still valid (expiry, usage cap — pricing.md atomic redemption)
- Slot still available (the Hold might have lapsed)

### Abandoned Draft Recovery

The highest-ROI email in booking platforms:

- Draft has email + no payment after ~1 hour → "your quote for Thursday is saved" with a resume link (customer-access.md token)
- One follow-up at ~24h max; the resume link reopens the draft with everything intact
- Slot from an expired Hold may be gone — resume flow re-offers nearest slots, never silently books a different time
- **Email only.** SMS recovery messages are marketing under TCPA — written consent territory (see notifications.md)

### Rules

- **The draft is the source of truth** — the UI renders it; it never carries state the server doesn't have.
- **Hold late, pay fast.** Slots lock at schedule step, not quote; the countdown is visible.
- **Every step is resumable** from a link. Losing funnel state = losing the booking.
- **Track step-level drop-off** (draft rows are your funnel analytics) — the step that leaks is a fact, not a guess.
