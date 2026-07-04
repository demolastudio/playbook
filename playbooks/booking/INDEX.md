# Booking Playbook — Index

> Patterns for building production-ready booking and service platforms.
> For general patterns (database, security, auth, etc.), see `core/INDEX.md`.
>
> **For AI agents:** Read `core/INDEX.md` FIRST for universal patterns.
> Then read this file for booking-specific patterns. Only load the files
> relevant to your current task.

## Booking-Specific Patterns

These chapters cover what makes booking platforms unique — slot management,
recurring services, cancellation policies, and booking-specific payment flows.

## Routing Table

| File | Covers | Read when you are... |
| ---- | ------ | -------------------- |
| [glossary.md](./glossary.md) | Seed domain language (Client, Plan, Visit, Deposit...) | Starting a new booking project — copy into CONTEXT.md |
| [concurrency.md](./concurrency.md) | Double-booking prevention, slot locking, GiST constraints | Preventing race conditions on slots/capacity |
| [state-machines.md](./state-machines.md) | Booking/plan/visit lifecycle, transition maps | Managing booking status lifecycle |
| [availability.md](./availability.md) | Slot generation, buffer time, capacity, waitlists | Building the availability engine |
| [rescheduling.md](./rescheduling.md) | Reschedule flow (not cancel+rebook), no-show prevention | Moving bookings, reducing no-shows |
| [calendar-sync.md](./calendar-sync.md) | Google/Outlook/iCal sync, dedup, conflict resolution | Integrating external calendars |
| [cancellation.md](./cancellation.md) | Time-based fees, grace periods, refund policies, timezone math | Implementing cancellation/refund logic |
| [recurring-services.md](./recurring-services.md) | Plans → visits, generation, skip/pause/resume, crew consistency | Building recurring service plans |
| [pricing.md](./pricing.md) | Quote engine, price locking, deposits, promo codes | Computing or charging any price |
| [billing.md](./billing.md) | Deposit/balance model, post-service charging | Booking-specific payment flows |
| [booking-funnel.md](./booking-funnel.md) | Quote→schedule→details→pay, drafts, holds, abandoned recovery | Building the public booking flow |
| [customer-access.md](./customer-access.md) | Login-free signed links, guest checkout, magic links | Any self-service client link |
| [notifications.md](./notifications.md) | Message matrix, SMS consent (TCPA), quiet hours, idempotent sends | Sending any client message |
| [migration.md](./migration.md) | Fresha/Acuity/Booksy exports, import pipeline, cutover | Onboarding an SME from a template tool |
| [events.md](./events.md) | Booking fan-out, reserve→charge→confirm saga | Building booking side-effect workflows |
| [anti-patterns.md](./anti-patterns.md) | Double-booking race, timezone bugs, slot testing | Reviewing booking code for common mistakes |
| [cheat-sheets.md](./cheat-sheets.md) | State machine transitions, booking Zod schemas | Quick reference during implementation |

## Also Read (from Core)

Route through `core/INDEX.md` as usual — for booking platforms, `idempotency`,
`billing`, `audit-trails`, `security`, and `database` are almost always relevant.
