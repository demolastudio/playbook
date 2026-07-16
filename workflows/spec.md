---
description: Use before planning any feature to gather requirements and resolve ambiguities by interview
---

# Spec

When triggered, do NOT plan or write code. Instead, interview the user.

## Process

1. Read the user's initial request (and `CONTEXT.md`, if the project has one)
2. Identify ambiguities, missing requirements, and assumptions
3. Split every open question into a **fact** or a **decision**:
   - **Facts** (how the code/data works today) — look them up in the codebase; never ask the user something the repo can answer
   - **Decisions** (what the product should do, trade-offs, preferences) — put each one to the user with your recommended answer, and wait. NEVER answer a decision yourself, even when running autonomously — an unanswered decision is a blocker, not a license
4. Ask the decision questions — present them as a numbered list
5. Wait for answers before proceeding
6. When an answer resolves a fuzzy or overloaded term, update `CONTEXT.md` inline per `.playbook/formats/context.md`; when a decision passes the three-question gate, offer an ADR per `.playbook/formats/adr.md`. Work the glossary actively: challenge terms that conflict with `CONTEXT.md` ("the glossary defines cancellation as X — you seem to mean Y"), stress-test relationships with edge-case scenarios, and when the code contradicts what the user says, surface the contradiction instead of picking a side
7. Sketch the **seams under test** — which public boundaries the tests will exercise (see `core/testing.md`). Prefer existing seams; place any new seam as high as possible; fewer is better. Confirm them with the user
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
- Ask at most 5 questions at a time — don't overwhelm
- Requirements must be testable ("user can X" not "improve UX")
- Seams are agreed in the spec, not improvised during implementation
- Present the spec for approval before planning or coding
