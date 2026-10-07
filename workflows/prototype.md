---
description: Use when a design question needs throwaway code to answer it - a clickable HTML demo for state/logic questions, or radically different UI variants on one route
---

# Prototype

A prototype is **throwaway code that answers a question**. The question decides the shape — pick the branch first; building the wrong shape wastes the whole prototype. If the question is ambiguous and the user is away, pick by the surrounding code (a backend module → logic, a page → UI) and state the assumption at the top.

## Branch 1: Logic ("does this state model / data shape feel right?")

For state machines, pricing rules, data models — anything that looks fine on paper but only breaks when pushed through real cases (e.g. a booking or deposit lifecycle from `.playbook/playbooks/booking/state-machines.md`).

1. Write the question at the top of the demo, visibly — one paragraph, checkable later.
2. Isolate the logic as a **pure module** in one `<script>` block (reducer, transition map, or function set — no DOM, no I/O). The page calls into it, never the reverse; the module is the keepable part.
3. Wrap it in **one self-contained HTML file** — plain HTML/CSS/JS, no framework, no build, no server — so anyone opens it by double-click, including the client. Labels use the domain's language, not the code's:
   - the full current state as a labelled panel, re-rendered after every click
   - free-play buttons, one per action, always available
   - guided walkthrough tabs: each a scenario (happy path, a tricky edge, an attempt at something illegal) with its buttons in order, starting from a fixed state
4. Hand it over — the user or client drives it. "Wait, that shouldn't be possible" is the output; those are bugs in the idea.

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
- **Capture, then clear main:** fold the validated decision (winning variant, proven reducer) into the real code; record the verdict where the work is tracked (spec, ADR if it passes the gate). Commit the prototype itself to a throwaway `prototype/<name>` branch and point to it from the spec — main keeps only the decision, the evidence stays findable, and no losing variant or switcher rots on main.
- Prototype code is exempt from definition-of-done gates while it lives; anything promoted into real code is rewritten to pass them — prototype constraints are not production constraints.
