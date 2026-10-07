# Checks — NestJS Stack

Commands for the automated gates in `rules/definition-of-done.md`.
Prefer the project's own `package.json` scripts if they exist; these are the fallbacks.

| Gate | Command |
| ---- | ------- |
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx oxlint` — config and reason in `stacks/nextjs/checks.md` (TypeScript 7 breaks typescript-eslint) |
| Tests | `npx jest` (or `npx vitest run`) |

Expand alongside STACK.md when the first NestJS project fills in this profile.
