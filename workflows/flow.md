---
description: Use when unsure which workflow fits the current situation - a router over all playbook workflows
---

# Flow

A map of the workflows and how they chain. Read the situation, route to the workflow, stop.

## The Main Flow: idea → shipped

0. **/grill** (when starting from a raw idea) — relentless interview in rounds — every question whose prerequisites are settled, each carrying a recommended answer — until the idea hardens into a brief. Works for any fuzzy idea — feature, package, post, business move. Skip when the work is already well-defined.
1. **/spec** — interview the user until requirements are unambiguous. Facts come from the codebase, decisions from the user; resolves fuzzy terms into `CONTEXT.md`, records qualifying decisions as ADRs, agrees the seams under test.
2. **Plan** — present the implementation plan, wait for approval (global rule 2).
3. **Implement** — build under the approved plan; the stack profile and templates govern the code.
4. **/review** — two-axis review of the diff: Standards and Spec.
5. **/deploy-check** — production-only concerns, after definition-of-done already passes.
6. **/learnings** — post-project capture that feeds the playbook.

Steps 1–2 belong in one unbroken context window; start implementation fresh from the spec when the window is already deep.

## On-Ramps

Situations that generate work, merging back into the main flow:

- **Something is broken** → **/debug** — refuses to hypothesize until a tight feedback loop reproduces the bug.
- **Periodic health check** → **/audit** — full security and performance sweep against playbook standards. Run every few days on active projects.
- **Code needs restructuring without behavior change** → **/refactor**.
- **A merge or rebase is stuck on conflicts** → **/merge-conflicts** — resolves by intent, never aborts.

## Standalone

- **/grill** also runs outside the main flow entirely — any idea that needs hardening, code or not. The brief it produces is the artifact; `/spec` is only the next step when the idea ships as software.
- **/prototype** — a design question that needs throwaway code to answer (does this state model hold up? what should this page look like?). Feeds `/grill` or `/spec` with a verdict instead of a guess; the prototype itself never lands on main.

## Crossing Sessions — at a Phase Boundary Only

A **phase** is a chunk of work (the grilling, the implementation, the QA). Decide what happens to the context only at the boundary between two phases — mid-phase, continue or hand a scoped piece to a subagent. Work top to bottom; the first yes wins:

1. **Continue** — the next phase needs this one verbatim (grill → spec is the standard case), or the window still has room for it. Costs nothing, loses nothing.
2. **Clear** (harness built-in) — everything here is disposable. Clearing a *relevant* context loses the why behind what was built.
3. **/handoff** — only when something travels: a new harness, a new directory or repo, a colleague, or a side task forked mid-phase.
4. **Subagent** — the next piece runs unattended (reviewing the diff, a research question); this session stays untouched.
5. **Compact** (harness built-in) — the default, not the first reach: relevant context, same harness, you stay in the loop. Tell it what the next phase needs.

Every move except Continue swaps the conversation for a summary of it — pay that loss only when staying costs more.

## Rules

- One workflow at a time — finish or hand off before starting another.
- When a new workflow is added or renamed, update this map in the same change. A router that lies is worse than no router.
