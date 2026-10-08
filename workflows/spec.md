---
description: Use before planning any feature to gather requirements and resolve ambiguities by interview
effort: xhigh
---

# Spec

When triggered, do NOT plan or write code. Instead, interview the user.

## Process

1. Read the user's initial request (and `CONTEXT.md`, if the project has one)
2. Identify ambiguities, missing requirements, and assumptions
3. Split every open question into a **fact** or a **decision**:
   - **Facts** (how the code/data works today) — look them up in the codebase; never ask the user something the repo can answer
   - **Decisions** (what the product should do, trade-offs, preferences) — put each one to the user with your recommended answer, and wait. NEVER answer a decision yourself, even when running autonomously — an unanswered decision is a blocker, not a license
4. Ask the decision questions in **rounds**: every decision whose prerequisites are settled, numbered, each with your recommendation worded so "yes" accepts it (the `/grill` shape)
5. Wait for the round's answers, then ask the next round — a question that depends on an open answer waits for it
6. When an answer resolves a fuzzy or overloaded term, update `CONTEXT.md` inline per `.playbook/formats/context.md`; when a decision passes the three-question gate, offer an ADR per `.playbook/formats/adr.md`. Work the glossary actively: challenge terms that conflict with `CONTEXT.md` ("the glossary defines cancellation as X — you seem to mean Y"), stress-test relationships with edge-case scenarios, and when the code contradicts what the user says, surface the contradiction instead of picking a side
7. Sketch the **seams under test** — which public boundaries the tests will exercise (see `core/testing.md`). Prefer existing seams; place any new seam as high as possible; fewer is better. Give each a one-line note on what it catches and what it misses, then confirm them with the user
8. After answers, produce a short spec document

## Spec Document Structure

```markdown
# Spec — [Feature Name]

## What
One paragraph describing the feature.

## Requirements
- Numbered list of specific, testable requirements

## Out of Scope
- What this feature does NOT include

## Technical Approach
- Key technical decisions (which files, patterns, packages)

## Seams Under Test
- The agreed public boundaries the tests will exercise (existing seams preferred)

## Open Questions
- Anything still unclear after the interview
```

## Rules

- NEVER skip the interview — even if the request seems clear
- Facts come from the codebase; decisions come from the user — never invert either
- A round holds only questions whose prerequisites are settled — never batch a question that depends on an open answer
- Requirements must be testable ("user can X" not "improve UX")
- Seams are agreed in the spec, not improvised during implementation
- Present the spec for approval before planning or coding
