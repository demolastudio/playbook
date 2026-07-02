## Calendar Integration (Bi-Directional Sync)

> Syncing bookings with providers' external calendars (Google, Outlook, iCal).
> Split from availability.md — read that first for the availability engine itself.

| Direction | What Happens | Why |
| --------- | ------------ | --- |
| **Outbound** (your system → external) | Push confirmed bookings to Google/Outlook/iCal | Provider sees their schedule in their personal calendar |
| **Inbound** (external → your system) | Pull busy events back into your availability engine | Prevents booking when provider has a personal commitment |

### Sync Mechanisms

| Method | Speed | Reliability | Use For |
| ------ | ----- | ----------- | ------- |
| **Webhooks (push)** | Near real-time (seconds) | Can fail silently | Primary sync channel |
| **Incremental polling (sync tokens)** | Minutes (5–15 min interval) | Reliable fallback | Catches missed webhooks |
| **iCal / .ics feeds** | Hours (12+ hour lag typical) | Unreliable for real-time | Read-only legacy calendars |

**Recommended:** Webhooks as primary, incremental polling as fallback. Never rely solely on iCal feeds for live availability.

### Deduplication

Bi-directional sync creates infinite loop risk (Sync A triggers Sync B, which triggers Sync A...):

- **Tag events with a custom metadata field** (e.g., `x-booking-id`) to identify events your system created
- **Ignore updates to your own events** — if the metadata matches your system, skip processing
- Use event IDs consistently across systems for matching

### Conflict Resolution

If inbound sync reveals a conflict (external event blocks a slot that's already booked):

- **Never auto-cancel a confirmed booking** based on an external calendar event
- **Flag it for manual resolution** — notify the provider with options: cancel the booking, move the personal event, or keep both (overlap)
- Log the conflict in the audit trail

### Rules

- **Calendar sync is a mirror, not a source** — your database is the source of truth. External calendars reflect it.
- **Every inbound event is untrusted input** — validate and sanitize before it touches availability.
- **Sync failures must be visible** — a silently stale calendar causes double-bookings in the real world even when your database is consistent.
