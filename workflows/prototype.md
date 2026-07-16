---
description: Use when a design question needs throwaway code to answer it - a terminal harness for state/logic questions, or radically different UI variants on one route
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape — pick the branch first; building the wrong shape wastes the whole prototype.

## Branch 1: Logic ("does this state model / data shape feel right?")

For state machines, pricing rules, data models — anything that looks fine on paper but only breaks when pushed through real cases (e.g. a booking or deposit lifecycle from `.playbook/playbooks/booking/state-machines.md`).

1. Write the question at the top of the file — one paragraph, checkable later.
2. Isolate the logic as a **pure module** (reducer, transition map, or function set — no I/O, no terminal code). The logic is the keepable part; everything around it is shell.
3. Wrap it in the smallest terminal harness: clear and re-render the full state every action, keyboard shortcuts listed at the bottom, loop until quit.
4. One command to run, via the project's existing task runner.
5. Hand it over — the user drives it. "Wait, that shouldn't be possible" is the output; those are bugs in the idea.

## Branch 2: UI ("what should this look like?")

3 variants (max 5), on one route, switched by a `?variant=` search param with a small floating switcher (arrows cycle, URL-stable, hidden in production builds).

- **Prefer mounting variants inside an existing page** — real header, real data, real density. An empty route makes every variant look fine.
- Variants must be **structurally different** — layout, hierarchy, primary affordance. Three re-colored card grids is wallpaper, not a prototype.
- Variants explore structure, never new tokens: the `DESIGN.md` lock and the design taste in `.playbook/playbooks/ui-ux/INDEX.md` still apply.
- Read-only: mutations point at stubs.

## Rules (both branches)

- **Throwaway from day one, clearly marked** — the word "prototype" in the path or name.
- **No tests, no error handling beyond runnable, no persistence** — memory only, unless persistence IS the question.
- **Answer one question.** No "what if we later need X".
- **Capture, then remove:** fold the validated decision (winning variant, proven reducer) into the real code; record the verdict where the work is tracked (spec, ADR if it passes the gate); the prototype itself leaves main — losing variants and switchers left behind rot and confuse the next reader.
- Prototype code is exempt from definition-of-done gates while it lives; anything promoted into real code is rewritten to pass them — prototype constraints are not production constraints.
