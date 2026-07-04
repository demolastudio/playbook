## Migration (Off Fresha / Acuity / Booksy)

> Every project starts with an SME leaving a template tool. The migration IS
> the first deliverable — botch it and the business loses bookings and trust
> in week one.

### What Exports — and What Doesn't

| Data | Exportable? | Reality |
| ---- | ----------- | ------- |
| Client list | ✅ CSV/Excel (Fresha, Acuity, Booksy all support it) | Names, email, phone, notes — the easy part |
| Appointments | ✅ CSV (per date range) | Upcoming + history; field names differ per tool |
| Saved cards | ❌ Never in a CSV | Cards live in the old processor's vault (PCI). Path A: processor-to-processor transfer request into Stripe (most processors support it, takes days–weeks). Path B: clients re-enter card at next booking via pay link |
| Recurring plans | ❌ Effectively not | Standing appointments export as individual rows at best — the *rule* (frequency, preferences) must be reconstructed |
| Reviews, gift cards, packages | ❌/varies | Audit per business; often manual or abandoned |

### The Import Pipeline

```
1. Export CSVs from the old tool (clients + appointments, full history range)
2. Map fields → glossary entities (Client, Booking, Visit, Plan — glossary.md)
3. Normalize: emails lowercased, phones to E.164, timezones explicit
4. Dedupe clients on normalized email + phone (same person, three spellings)
5. Import in a staging environment first — counts reconciled against the old tool's own totals
6. Import clients → import future bookings → reconstruct plans → verify
```

- The importer is **idempotent** (natural key: old tool's row ID, stored as `externalRef`) — re-running after a fix never duplicates
- Keep `externalRef` forever: "this booking came from Acuity row X" answers every support mystery for the next year

### Future Bookings Are Sacred

- Imported upcoming appointments keep their **original date, time, crew, and price** — the price they agreed to in the old tool is honored even if new pricing differs (price-lock principle, pricing.md)
- Deposit/payment state must be mapped explicitly: paid-in-old-tool bookings are marked settled — the new system must NEVER re-charge or re-request a deposit already taken
- Reconstruct recurring plans WITH the client: detect repeating patterns in history (same client, same cadence), create the Plan, then confirm by message — never guess a standing appointment into existence

### Cutover

```
1. Freeze: stop taking NEW bookings in the old tool (keep it read-only)
2. Final delta export → import (bookings made since the first import)
3. Go live; old booking page redirects/points to the new funnel
4. Announcement to all clients: new booking link + "your appointments moved with us"
   (transactional message — it concerns their existing bookings)
5. Old tool stays read-only for 60–90 days as the reconciliation reference
```

- Schedule cutover in the business's slowest window (Sunday night, not Friday)
- Reminders for imported bookings must be live from minute one — clients don't care which system sends them

### Rules

- **Reconcile counts, not vibes**: clients, future bookings, and revenue-at-risk totals must match the old tool before go-live.
- **Never re-charge imported money.** Payment state mapping is reviewed line by line for future bookings.
- **Plans are confirmed, not inferred silently.**
- **`externalRef` on every imported row, kept forever.**
- **The old tool is frozen, not deleted** — it's the audit reference for the first quarter.
