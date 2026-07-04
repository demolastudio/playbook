## Booking Glossary — Seed CONTEXT.md

> Starter domain language for a new booking project. Copy into the project's
> `CONTEXT.md` (see `.playbook/formats/context.md`), then rename terms to the
> business's own words — a salon says Stylist where a cleaning company says Crew.
> The structure and the `_Avoid_` discipline stay.

### Language

**Client**:
The person who books and pays. _Avoid_: customer, user, guest

**Service**:
A bookable offering with a duration, base price, and buffer requirements. _Avoid_: product, treatment, job type

**Add-on**:
An optional extra attached to a booking that adjusts price and possibly duration. _Avoid_: extra, upsell

**Quote**:
The itemized, locked price breakdown produced before booking. _Avoid_: estimate, price

**Booking**:
A client's confirmed claim on a slot for a service — one-time work. _Avoid_: reservation, appointment, order

**Plan**:
A recurring service agreement (frequency, preferred time, locked pricing) that generates visits. _Avoid_: subscription, membership, contract

**Visit**:
One occurrence generated from a plan — scheduled, delivered, and charged individually. _Avoid_: session, occurrence, appointment

**Slot**:
A materialized bookable time window for a resource. _Avoid_: timeslot, opening

**Hold**:
A temporary TTL-bound soft lock on a slot while checkout completes. _Avoid_: pending booking, reservation

**Crew**:
The staff member or team who delivers the service. _Avoid_: provider, worker, employee

**Deposit**:
The partial payment taken at booking time that commits the client. _Avoid_: down payment, prepayment

**Balance**:
The remainder due, collected via login-free payment link or off-session charge. _Avoid_: remaining payment, final payment

### Relationships

- A **Client** has many **Bookings** and at most a few **Plans**
- A **Plan** generates **Visits** on a rolling window
- A **Slot** carries at most one **Hold** or one **Booking**/**Visit** at a time
- A **Booking** takes a **Deposit** at creation and a **Balance** later; a **Visit** charges after delivery
