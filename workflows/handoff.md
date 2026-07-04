---
description: Use when ending a session or forking to a fresh one and the next agent needs the context
---

# Handoff

Generate a `HANDOFF.md` file in the project root with the following sections:

## Structure

```markdown
# Handoff — [Project Name]

Generated: [current date/time]

## Goal
What we are building. One paragraph max.

## Current State
What is done and what is in progress. Use a checklist:
- [x] Completed items
- [/] In progress items
- [ ] Not started items

## Decisions Made
Architectural choices already settled. Do NOT re-litigate these in the next session.

## Blocked On
Current issues, pending user input, or unresolved questions.

## Next Steps
Explicit, actionable items for the next session. Be specific — file paths, function names, what to implement.
```

## Rules

1. Read the codebase and recent changes before generating
2. Keep it concise — the next agent reads this first, token efficiency matters
3. **Reference, don't duplicate.** Never restate what already lives in specs, ADRs, CONTEXT.md, commits, or diffs — link the path. Decisions that qualify as ADRs (see `.playbook/formats/adr.md`) go there, not here.
4. Only include decisions that were explicitly made, not assumptions
5. Next steps must be actionable, not vague ("implement X in Y file" not "continue working")
6. Redact secrets and personal data — API keys, passwords, customer information
7. Overwrite any existing HANDOFF.md

## Handoff vs Compact

Handoff **forks**: the next session starts fresh and reads HANDOFF.md. Compact (the harness built-in) **continues**: same conversation, summarized. Fork when the window is deep or the next task deserves clean context; compact only at natural phase breaks, never mid-phase.
