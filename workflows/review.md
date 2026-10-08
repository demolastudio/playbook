---
description: Use to review recent changes on two axes - playbook standards and the originating spec
effort: xhigh
---

# Review

Review the diff on two independent axes. Code can pass every standard while implementing the wrong thing, and vice versa — never merge the axes, so one cannot mask the other.

## Process

1. Pin the fixed point the review compares against — a commit, branch, or `main`; ask if unclear. Diff with `git diff <fixed-point>...HEAD` (three-dot: against the merge-base). Confirm the ref resolves and the diff is non-empty before reviewing anything
2. Read `.playbook/rules/` — all rule files — plus every file where the project documents its own standards (`CONTRIBUTING.md`, `CODING_STANDARDS.md`, `docs/`); a project standard overrides the playbook baseline
3. Find the originating spec: a spec/PRD document, the issue, or the user's original request. If none exists, the Spec axis reports "no spec available" and is skipped.
4. Run both axes. If your harness supports parallel sub-agents, run each axis in one and keep each report under 400 words; otherwise run them sequentially with the same word cap.
5. Run the automated gates from `.playbook/rules/definition-of-done.md` and include the results.

## Axis 1: Standards

Check the diff against every applicable rule:

- **Code style** — no comments, no duplicate logic (one source of truth), split by concern
- **Structure** — kebab-case names, files in the correct folders, stack profile followed, templates used for new code
- **Mistakes** — no suppression comments, no speculative features, no placeholder content, no refactoring of untouched code

Plus the smell baseline below — each is a judgment call ("possible feature envy"), never a hard violation; a documented project standard overrides it; skip anything tooling already enforces:

| Smell | It is → fix |
| ----- | ----------- |
| Mysterious name | Name doesn't reveal purpose → rename; if no honest name comes, the design is murky |
| Duplicated code | Same logic shape in two places → extract, call from both |
| Feature envy | Method uses another module's data more than its own → move it there |
| Data clumps | Same fields always travel together → bundle into one type |
| Primitive obsession | String/number standing in for a domain concept → give it a type |
| Repeated switches | Same if/switch cascade recurring → polymorphism or one shared map |
| Shotgun surgery | One logical change scattered across many files → gather into one module |
| Divergent change | One module edited for unrelated reasons → split by reason |
| Speculative generality | Abstraction for needs the spec doesn't have → delete, inline back |
| Message chains | Long a.b().c().d() navigation → hide behind one method |
| Middle man | Module that mostly delegates → cut it, call the target |
| Refused bequest | Implementer ignoring most of what it inherits → composition instead |

## Axis 2: Spec

Compare the diff against what was actually asked:

- **Missing** — requirements asked for but absent or partial
- **Scope creep** — behavior in the diff nobody asked for
- **Wrong** — requirements that look implemented but whose implementation looks incorrect

Quote the spec line (or the user's words) for each finding.

## Output

Present `## Standards` and `## Spec` sections separately, then one line each: finding count and worst issue per axis. Never pick a single winner across axes. Group by severity within each axis:

**🔴 Critical** — must fix before commit
**🟡 Warning** — should fix
**✅ Clean** — no issues

Include file path and line number for every finding.
