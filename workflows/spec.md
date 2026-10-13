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
9. **Builder check:** before presenting it, have a fresh subagent read the spec as the builder and list every question it would need answered (no subagent tool: read it as that builder yourself). Sort them: answered by the interview or the codebase → write the answer into the spec; minor (any sensible builder would settle it the same way) → decide, and mark it in the spec as your call; the user's (the answer changes what gets built) → one final round

## Spec Document Structure

```markdown
# Spec — [Feature Name]

## What
One paragraph describing the feature.

## Requirements
- Numbered list of specific, testable requirements; each behavior as **Given** <state>, **When** <action>, **Then** <result> — the integration tests are written from these

## Out of Scope
- What this feature does NOT include, plus anti-goals: what would make it a failure even if it technically works

## Technical Approach
- Key technical decisions (which files, patterns, packages)

## Seams Under Test
- The agreed public boundaries the tests will exercise (existing seams preferred)

## Phases
- [ ] 1. <phase> — delivers requirements 1, 2
- [ ] 2. <phase> — delivers requirement 3

## Open Questions
- Anything still unclear after the interview
```

## Rules

- NEVER skip the interview — even if the request seems clear
- Facts come from the codebase; decisions come from the user — never invert either
- A round holds only questions whose prerequisites are settled — never batch a question that depends on an open answer
- Requirements must be testable ("user can X" not "improve UX")
- Seams are agreed in the spec, not improvised during implementation
- Every phase names the requirements it delivers, and every requirement is in a phase; tick a phase in this file when it is built
- Present the spec for approval before planning or coding
