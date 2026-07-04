---
description: Use when restructuring existing code without changing its behavior
---

# Refactor

When triggered, follow this structured refactoring process.

## Process

1. **Explain WHY** — State the problem with the current code before touching anything
2. **Show scope** — List exactly which files and functions will change
3. **Present the plan** — Show before/after for the key changes
4. **Wait for approval** — Do NOT proceed without explicit go-ahead
5. **Implement** — Make surgical changes only
6. **Verify** — Run the gates from `.playbook/rules/definition-of-done.md`; behavior must be unchanged

## Rules

- NEVER refactor and add features in the same step
- NEVER refactor code you weren't asked to touch
- NEVER change behavior — refactoring preserves behavior, it does not change it
- If tests don't exist for the code being refactored, write them FIRST
- Keep commits atomic — one refactoring concern per commit
