---
description: Use when work must travel to another session, harness, directory, or person and the next agent needs the context
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
5. Next steps must be actionable, not vague ("implement X in Y file" not "continue working") — and name the workflow the next session should start with when one fits (e.g. "/debug the failing webhook test", "/spec the reminder feature")
6. Redact secrets and personal data — API keys, passwords, customer information
7. Overwrite any existing HANDOFF.md

## When to Hand Off

Only when something travels — a new harness, directory, or colleague, or a side task forked mid-phase. Otherwise continue, clear, send a subagent, or compact: the phase-boundary tree in `.playbook/workflows/flow.md` orders them.
