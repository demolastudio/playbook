## Exports & Reports

> CSV/PDF exports for SME owners — accountant handoffs, tax season, "can I
> get this in Excel?" Owners ask for this early and often; build it once, properly.

### Export Pipeline

Small exports (< ~5K rows) can stream synchronously from a route handler. Beyond that:

```
1. Owner clicks Export → job row created (status: PENDING, filters snapshot)
2. Background worker runs the query in pages, writes CSV to storage
3. Job → READY; notify with a signed, expiring download link
4. UI shows job status; downloads never block the dashboard
```

- The export uses the **same filtered query as the table view** (same searchParams → same DAL function) — an export that disagrees with the screen is a bug report
- Money exports in **two columns**: `amount_cents` (integer) and `amount` (formatted) — accountants want both
- Dates in the **business timezone**, ISO-formatted, timezone stated in the header row

### CSV Safety

- **Formula injection:** any cell starting with `=`, `+`, `-`, `@` gets prefixed with `'` — a client named `=HYPERLINK(...)` must not execute in the owner's Excel
- UTF-8 with BOM (Excel's encoding detection needs it for names like "Adéọlá")
- Quote everything; escape embedded quotes; `\r\n` line endings for Excel compatibility

### Access & Audit

- Exports are **Owner-scoped by default** (`rbac.md`) — a full client-list CSV is the business's crown jewels walking out the door
- Every export is audit-logged: who, what filters, how many rows (`core/audit-trails.md`)
- Download links are signed and expiring (same token rules as `booking/customer-access.md`); files auto-delete after 7–30 days

### Standard Reports for Booking SMEs

| Report | Contents | Period |
| ------ | -------- | ------ |
| Revenue | Charges, refunds, fees by service — reconciles against Stripe | Monthly |
| Bookings | Volume, cancellations, no-show rate | Weekly/monthly |
| Client list | Contacts + plan status + lifetime value | On demand |
| Payouts-ready | Completed visits per crew for payroll | Per pay period |

Reports are **saved filter presets over the export pipeline** — not separately-coded pages.

### Rules

- **Export = the table's query.** One DAL function serves both.
- **Sanitize for formula injection. Always.**
- **Owner-scoped, audit-logged, expiring links.**
- **Async beyond 5K rows** — no export ever times out a request or freezes the dashboard.
