## Pricing & Quotes

> The quote engine: how a price is computed, locked, and defended.
> Custom pricing rules are a top reason SMEs leave template booking tools.

### The Quote Engine Is One Pure Function

One source of truth, no side effects, fully testable:

```
quote(service, attributes, addOns, frequency, promo) → {
  lineItems: [
    { label: "Deep clean — 3 bed / 2 bath", amountCents: 18000 },
    { label: "Inside fridge",               amountCents: 2500  },
    { label: "Bi-weekly discount (15%)",    amountCents: -3075 },
    { label: "Promo WELCOME10",             amountCents: -1743 },
  ],
  totalCents: 15682,
  depositCents: 4705,
  currency: "USD",
}
```

- **Base price from service attributes** (bedrooms/bathrooms, duration tier, square footage — whatever the business prices on)
- **Add-ons adjust price AND duration** — an add-on that extends work must extend the blocked time (see [availability.md](./availability.md) buffers)
- **Frequency discount rewards the plan commitment** (weekly 20%, bi-weekly 15%, monthly 10% — configurable per business)
- **Order matters and is fixed:** base → add-ons → frequency discount → promo. Document the order; disputes hinge on it.

### Money Rules

- **Integer minor units only** (`amountCents: 15682`), never floats — `0.1 + 0.2` bugs have no place in charges
- Rounding happens **once, at the final total**, half-up, and the rule is written down
- Every stored amount carries its **currency**; no implicit defaults in code

### Price Locking

**The price quoted is the price charged — forever.**

- The full line-item breakdown is **copied onto the booking** at creation (not referenced — copied). Rate changes later never touch existing bookings.
- A plan locks its pricing the same way; each generated visit copies its price from the plan at generation time (see [recurring-services.md](./recurring-services.md)).
- Business raises rates → new rates apply to new quotes and newly generated visits after client notification. Grandfathering existing plans is a business decision; silently repricing is a dispute machine.
- The stored breakdown IS your dispute evidence: "you agreed to these line items on this date."

### Deposits

- Deposit = percentage or flat amount, configured per service (30–50% typical)
- Derive once at quote time, store both: `depositCents` + `balanceCents = total - deposit`. Never re-derive later from a percentage — the rate may have changed.
- Balance flow and off-session consent: [billing.md](./billing.md)

### Promo Codes

Promo codes are a **concurrency problem** wearing a marketing hat:

| Constraint | Enforcement |
| ---------- | ----------- |
| Usage limit (100 total) | Atomic decrement: `UPDATE promo SET uses = uses + 1 WHERE code = X AND uses < max_uses` — check the affected row count, never read-then-write |
| One per client | Unique constraint on (promoId, clientId) at redemption |
| First-booking only | Check bookings count server-side at redemption, not in the UI |
| Expiry | Validate at redemption in business timezone; a code valid at quote time can expire before checkout — revalidate when booking |
| Stacking | Default NO — one promo per booking. Stacking is opt-in per business and capped |

Redemption is recorded in the same transaction as booking creation — a promo attached to an abandoned checkout was never redeemed.

### Quote Lifecycle

```
Quote shown (web funnel, no account needed)
  → valid for N days (store quotedAt + expiry)
  → booking created from quote → breakdown copied, deposit charged
  → expired quote revisited → recompute at current rates, show the change honestly
```

Store quotes server-side once contact info exists — an emailed "your quote is waiting" link converts abandoned funnels (see anti-patterns on trusting client-side prices).

### Rules

- **One quote function.** Admin preview, funnel display, and charge amounts all call it — never a second implementation in the UI.
- **The client-submitted price is never trusted.** The server recomputes or reads the stored quote; the frontend total is decoration (see [anti-patterns.md](./anti-patterns.md)).
- **Copied, not referenced.** Bookings and visits own their price breakdown snapshot.
- **Promo redemption is atomic** and transactional with booking creation.
- **Every price shown is itemized** — line items build trust at checkout and win disputes after it.
