# Code Style

> The global rules in [global-rules.md](./global-rules.md) always apply.
> This file adds the principles behind them — the "why" and the deeper habits.

## Principles

- **One source of truth.** Every function, every business rule — defined in one place, called from everywhere. Never duplicate logic.
- **Readable without comments.** If code needs a comment to be understood, rename or restructure it until it doesn't.
- **Split by concern.** Dedicated folders per type of code (`types/`, `schemas/`, `actions/`, `hooks/`). Readability and scalability over convenience.

---

## Karpathy's 4 Principles

1. **Think Before Coding** — State assumptions explicitly. If ambiguous, present multiple interpretations. Ask for clarification when confused. Never silently assume.
2. **Simplicity First** — Write the minimum code necessary to solve the exact request. No speculative features, no unnecessary abstractions, no "flexibility" that wasn't asked for.
3. **Surgical Changes** — Touch only what is strictly necessary. Do not refactor adjacent code, "improve" formatting, or clean up dead code unless it is part of the task.
4. **Goal-Driven Execution** — Define clear, verifiable success criteria before starting. Loop until all criteria are met. Use tests-first where possible.

---

## Deep Modules

- **Deep, not shallow:** a lot of behaviour behind a small interface at a clean **seam** — the boundary callers and tests both enter through. A test reaching past the interface means the module is the wrong shape.
- **Deletion test:** delete the module in your head — complexity vanishes → pass-through; reappears across callers → earning its keep.
- **One adapter = hypothetical seam; two = real.** No interface/port until something varies across it (production + test).
- **Accept dependencies, don't create them** (`processOrder(order, gateway)`, never `new StripeGateway()` inside); return results over side effects.

---

## Closed Loops

Every task runs act → check against objective truth → repair, with an explicit stop condition. Never assume something works — check it. The concrete check is [definition-of-done.md](./definition-of-done.md).
