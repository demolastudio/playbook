## Notifications

> Which message, at which lifecycle moment, on which channel — and the consent
> rules that make SMS legal. Reminder flows cut no-shows more than any other
> feature; duplicated or ill-timed ones destroy trust faster than any other bug.

### The Message Matrix

| Trigger | Message | Channel | Timing |
| ------- | ------- | ------- | ------ |
| Booking created | Confirmation + manage link + policy | Email | Immediate |
| Deposit paid | Receipt | Email | Immediate |
| Balance due | Login-free pay link | Email + SMS | Day −7, −3, −1 (billing.md) |
| Upcoming visit | Reminder + confirm/reschedule links | SMS (email fallback) | Day −2 and day-of morning |
| Crew en route / substituted | Heads-up ("Maria is covering today") | SMS | Day-of |
| Visit completed | Receipt for post-service charge | Email | On charge success |
| Payment failed | Update-payment link | Email + SMS | Immediate, then per dunning |
| Cancellation/reschedule | Confirmation of the change + any fee | Email | Immediate |
| Review request | One ask, one link | Email or SMS | ~2h after completion |
| Free-cancel window closing | "Cancel free until tomorrow 2pm" | SMS | 24h before deadline |

Per-business configuration: every timing and channel above is a setting, not a constant.

### Consent — Two Classes, Never Blurred

| Class | Examples | Consent required (TCPA) |
| ----- | -------- | ----------------------- |
| **Transactional/informational** | Reminders, receipts, balance links, crew updates | Prior express consent — the client providing their number in the booking context covers it |
| **Marketing** | Promos, win-back, "book again", abandoned-funnel SMS | Prior express **written** consent — an unticked-by-default checkbox, recorded with timestamp |

- One number field at checkout + a separate, optional marketing checkbox. Reminders never depend on the marketing box.
- **Opt-out by any reasonable channel** (reply STOP, email, phone, in person) — honored across ALL message types within 10 business days; store `smsOptedOutAt` and check it in the send path, not in the scheduler.
- Consent is per-business and non-transferable (2026 one-to-one consent rules).

### Quiet Hours

- Federal window: 8am–9pm **recipient's local time**; several states end at 8pm.
- **Ship 9am–8pm local as the default** — inside every US rule with margin; make it configurable per business, not per developer opinion.
- Recipient timezone = the service address timezone (you always have it), not the server's.
- A scheduled send landing in quiet hours **queues to the next window open** — never drops, never fires anyway.

### Delivery Discipline

- **Every message is idempotent**: `message_log` keyed `{type}:{entityId}:{occurrence}` (e.g. `reminder:24hr:visit_123`) — check, send, record in one place (anti-pattern 8).
- Sends go through **one dispatch function** (SSOT) that enforces: opt-out check → quiet hours → idempotency → provider call with the log key as provider idempotency key.
- SMS for time-critical + short (reminders, day-of); email for records (receipts, policies, links that must be findable later). Never SMS what needs to be re-read.
- Log provider message IDs and delivery status — "did the client get the reminder?" is a support question you must be able to answer (fee disputes hinge on it).

### Rules

- **The send path enforces the law**, not the scheduler — opt-outs and quiet hours checked at the moment of sending.
- **Marketing and transactional consent never share a checkbox.**
- **One review ask per visit. One recovery email per draft.** Nagging is churn.
- **Every fee-related message is logged with timestamp and content** — it's evidence (cancellation.md disputes).
