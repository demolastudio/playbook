# Code Style

> Design habits beyond the global rules; file names and arrow functions are lint-enforced.

## Deep Modules

- **Deep, not shallow:** a lot of behaviour behind a small interface at a clean **seam** — the boundary callers and tests both enter through. A test reaching past the interface means the module is the wrong shape.
- **Deletion test:** delete the module in your head — complexity vanishes → pass-through; reappears across callers → earning its keep.
- **One adapter = hypothetical seam; two = real.** No interface/port until something varies across it (production + test).
- **Make illegal states unrepresentable:** model variants as a discriminated union (`{ status: "pending" } | { status: "paid"; paidAt: Date }`), not optional fields; parse external data once at the boundary and never cast (`as`) past it. A UI flow with more than a few states (multi-step form, checkout, upload) is one reducer or state machine, not scattered `useState`.
- **Accept dependencies, don't create them** (`processOrder(order, gateway)`, never `new StripeGateway()` inside); return results over side effects.
