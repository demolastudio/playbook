## Customer Access (Login-Free Links)

> SME clients will not create accounts to pay a balance or move an appointment.
> Every self-service action rides a signed link — the pattern billing.md and
> notifications assume. Get the token design right once.

### Token Design

Every link token is **scoped, expiring, and server-verifiable**:

| Property | Rule |
| -------- | ---- |
| Random | 256-bit random value, stored **hashed** in the DB (like a password) — never a raw sequential ID |
| Scoped | One purpose + one entity: `pay-balance:{bookingId}`, `reschedule:{visitId}` — a pay link cannot cancel |
| Expiring | Purpose-sized TTL: pay-balance until service date; reschedule/cancel until policy deadline; view-booking 90 days |
| Revocable | DB-backed tokens die on demand (booking cancelled → links dead). This is why DB tokens beat stateless JWTs here |
| Single-use where it mutates | Payment links burn on success; view links may stay live |

```
URL shape:  https://book.{business}.com/b/{token}
Server:     hash(token) → lookup → check scope + expiry + not used → act
```

### Enumeration and Abuse

- Booking IDs in any URL are **cuid/uuid**, never sequential integers — `/bookings/1042` invites walking the list
- Rate-limit token lookups per IP; identical "invalid or expired link" response whether the token is wrong, expired, or used
- The link IS authentication for its one scope — never let a token session escalate to full account access

### Guest-First, Account Optional

- **Default: guest checkout.** Email + phone is identity; the confirmation email carries the manage link.
- The client record is keyed on email/phone behind the scenes — the same guest booking three times is ONE client with history (dedupe on normalized email + E.164 phone).
- Offer account creation AFTER the deposit succeeds ("save your details for next time"), never as a checkout gate.
- Returning client with an account: magic-link sign-in (email a short-lived token) beats passwords for this audience.

### Rules

- **Raw tokens are never stored or logged** — hash in DB, redact from logs (they're credentials).
- **One token, one scope, one entity.** Composite "manage everything" links widen every leak.
- **Expiry follows the business deadline** — a reschedule link that outlives the reschedule policy lies to the client.
- **Never gate checkout behind signup.** Every extra field before the deposit costs bookings.
