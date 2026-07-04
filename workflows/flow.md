---
description: Use when unsure which workflow fits the current situation - a router over all playbook workflows
---

# Flow

A map of the workflows and how they chain. Read the situation, route to the workflow, stop.

## The Main Flow: idea → shipped

1. **/spec** — interview the user until requirements are unambiguous. Resolves fuzzy terms into `CONTEXT.md`, records qualifying decisions as ADRs.
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

## Crossing Sessions

- **/handoff** — forks: compacts the conversation into `HANDOFF.md` so a FRESH session continues the work. Use when the window is deep or the next task deserves clean context.
- **Compact** (harness built-in) — continues: same conversation, earlier turns summarized. Use at natural phase breaks, never mid-phase.

## Rules

- One workflow at a time — finish or hand off before starting another.
- When a new workflow is added or renamed, update this map in the same change. A router that lies is worse than no router.
