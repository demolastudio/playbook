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

## Loop Engineering (2026)

The unit of engineering in 2026 is the **loop**, not the prompt.

- **Design closed-loop systems.** Every task follows: action → evaluate → repair. The agent acts, checks the result against objective truth, and iterates until verified.
- **Every loop needs 3 things:**
  1. **Trigger** — what starts the loop
  2. **Evaluation cycle** — agent checks if the goal is met after each action
  3. **Stop condition** — guardrails that prevent infinite loops, goal drift, and runaway costs
- **Verification is the critical step.** Never assume something works — check it. The concrete verification gate for this playbook is [definition-of-done.md](./definition-of-done.md).
- **The quality of the system is limited by the design of the loop, not the model.**
