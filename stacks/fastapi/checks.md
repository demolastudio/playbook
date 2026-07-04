# Checks — FastAPI Stack

Commands for the automated gates in `rules/definition-of-done.md`.
Prefer the project's own scripts (Makefile, pyproject tool config) if they exist; these are the fallbacks.

| Gate | Command |
| ---- | ------- |
| Typecheck | `mypy .` (or `pyright`) |
| Lint | `ruff check .` |
| Tests | `pytest` |

Expand alongside STACK.md when the first FastAPI project fills in this profile.
