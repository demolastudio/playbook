## Rescheduling & No-Shows

> Rescheduling is NOT cancel-plus-rebook. It preserves the booking's identity,
> payment, and history while moving it in time.

### Why Not Cancel + Rebook

| Concern | Cancel + rebook breaks it | Reschedule preserves it |
| ------- | ------------------------- | ----------------------- |
| Payment | Refund + recharge (fees twice, dunning risk) | Charge stays attached to the booking |
| Cancellation policy | May trigger a cancellation fee wrongly | Reschedule policy applies instead |
| History / audit | Two records, broken thread | One booking, one timeline |
| Notifications | "Cancelled" email alarms the customer | "Moved to Tuesday 3 PM" |
| Idempotency keys | New entity id → duplicate side-effect risk | Keys keyed on booking id stay valid |

### The Reschedule Flow

```
1. Validate the reschedule is allowed (policy: notice window, max reschedules)
2. Soft-lock the NEW slot (see concurrency.md) — old slot stays booked
3. In one transaction:
   ├── confirm new slot availability (constraint-checked)
   ├── update booking: new slot, RESCHEDULED transition recorded
   └── release the old slot
4. Audit-log: old time, new time, who initiated, reason
5. Notify customer + provider; update calendar sync (see calendar-sync.md)
```

**Order matters:** claim the new slot before releasing the old one. The reverse leaves the customer with nothing if the new slot is taken mid-flow.

### Reschedule Policy

Store on the service type, mirror the cancellation policy structure (see cancellation.md):

| Rule | Typical Value | Why |
| ---- | ------------- | --- |
| Minimum notice | Same as or shorter than cancellation notice | A reschedule is better for the business than a cancellation — make it easier |
| Max reschedules per booking | 2–3 | Prevents serial rescheduling abuse |
| Fee | Usually free where cancellation costs | Incentivize rescheduling over cancelling |
| Self-service window | Up to N hours before start | After that, require contacting support |

**Always offer reschedule prominently in the cancellation flow** — "Want to pick a new time instead?" recovers revenue that a cancellation loses.

### No-Show Prevention

No-shows waste capacity and revenue. Reduce them with:

| Strategy | Impact |
| -------- | ------ |
| **Multi-channel reminders** | Send at booking, 2 days before, and day-of (email + SMS) |
| **Active confirmation** | "Click to confirm attendance" — builds psychological commitment |
| **Deposit/prepayment** | Financial friction filters low-intent bookings |
| **Easy rescheduling** | A self-service reschedule link in every reminder — the #1 no-show reducer |
| **Track no-show rate per customer** | Flag repeat offenders; consider requiring prepayment for future bookings |

### Handling a No-Show

- Mark via explicit state transition (`CONFIRMED → NO_SHOW`, see state-machines.md) — never delete or silently cancel
- Charge per the no-show policy (full, partial, or deposit forfeit) using the booking's existing idempotency key
- Notify with a rebooking link — recover the relationship, not just the fee

### Rules

- **A reschedule is one atomic operation on one booking** — never two operations on two bookings.
- **New slot first, old slot second.** Never release before claiming.
- **Make rescheduling easier than cancelling** — every reschedule is revenue a cancellation would have lost.
- **No-show is a state, not a deletion** — the record and its charge history must survive for disputes.
