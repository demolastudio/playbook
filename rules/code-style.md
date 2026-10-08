# Code Style

> Design habits beyond the global rules. Kebab-case file names and arrow
> functions are also lint errors (the shipped `.oxlintrc.json`).

## Deep Modules

- **Deep, not shallow:** a lot of behaviour behind a small interface at a clean **seam** — the boundary callers and tests both enter through. A test reaching past the interface means the module is the wrong shape.
- **Deletion test:** delete the module in your head — complexity vanishes → pass-through; reappears across callers → earning its keep.
- **One adapter = hypothetical seam; two = real.** No interface/port until something varies across it (production + test).
- **Accept dependencies, don't create them** (`processOrder(order, gateway)`, never `new StripeGateway()` inside); return results over side effects.
