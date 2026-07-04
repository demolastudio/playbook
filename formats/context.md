# CONTEXT.md Format

> The project's domain glossary — a shared language between you, the agents,
> and the code. One concept, one word, used everywhere: files, functions,
> schemas, conversations. A shared term costs one token to reason with;
> an unresolved one costs a sentence every time it comes up.

## Structure

```md
# {Project Name}

{One or two sentences: what this product is.}

## Language

**Slot**:
A materialized bookable time window for a resource.
_Avoid_: timeslot, opening, time window

**Hold**:
A temporary TTL-bound soft lock on a slot while checkout completes.
_Avoid_: reservation, pending booking, lock

**Booking**:
A customer's confirmed claim on a slot. Only bookings charge and notify.
_Avoid_: reservation, appointment, order

**Resource**:
The person or asset a slot belongs to (stylist, room, cleaner).
_Avoid_: provider, staff, worker

## Relationships

- A **Resource** has many **Slots**
- A **Slot** carries at most one **Hold** or one **Booking** at a time
```

## Rules

- **Be opinionated.** When multiple words exist for one concept, pick the best and list the rest under `_Avoid_`.
- **Definitions stay tight.** One or two sentences. What it IS, not what it does.
- **Domain terms only.** General programming concepts (retry, timeout, cache) never belong, no matter how often the project uses them.
- **Glossary only.** Never a spec, scratchpad, or store of implementation decisions — decisions go to ADRs (see [adr.md](./adr.md)).
- **Update inline, the moment a term is resolved** — during a `/spec` interview, not batched afterwards.
- **Code follows the glossary.** Variables, functions, files, and schema fields use these exact terms.
