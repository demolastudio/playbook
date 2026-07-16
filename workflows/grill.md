---
description: Use when a raw idea needs stress-testing before it becomes a plan or spec - a relentless one-question-at-a-time interview
---

# Grill

Interview the user relentlessly about an idea until shared understanding is reached. This is the stage BEFORE `/spec` — no codebase required, no requirements yet. The idea can be anything fuzzy: a feature, a package, an OSS launch, a marketing post, a business move.

## Process

1. Walk down every branch of the idea's decision tree, resolving dependencies between decisions one by one — don't skip a branch because it seems settled.
2. Ask **ONE question at a time**, and wait for the answer before continuing. Each answer reshapes the next question; batches waste questions on branches the last answer killed.
3. **Every question carries your recommended answer** — the user reacts faster than they generate.
4. Facts vs decisions: if something can be looked up (a codebase, this playbook, online research), look it up — never ask. Decisions belong to the user — put each one to them and wait. NEVER answer a decision yourself.
5. "I don't know yet" is a valid answer — park that branch in the brief's open questions; don't force it.
6. **Grilling inside a project: work the docs inline.** As terms and decisions crystallize, resolve fuzzy terms into `CONTEXT.md` and offer an ADR when a decision passes the three-question gate (`.playbook/formats/`) — the same discipline as /spec, so nothing resolved here is lost if /spec runs in a fresh session. Non-code sessions skip this.
7. **Stop-gate:** do NOT plan, spec, or build anything until the user confirms shared understanding has been reached.

## Output: The Idea Brief

When the user confirms, produce the brief in chat:

```markdown
# Idea Brief — [name]

## The Idea
One sharpened paragraph.

## Decisions Made
Each decision with the rejected branches named — so they don't get re-proposed.

## Open Questions
The parked branches; anything that belongs to /spec.
```

Then offer to save it where the user points (`ideas.md` in a workspace, `IDEA.md` in a project) — never save unasked. If the idea is heading into code, end with: "ready for `/spec`."

## Rules

- Relentless means every branch, not rapid-fire — depth over speed.
- One question, one recommendation, one answer. Then the next.
- Rejected branches are recorded by name — an unrecorded rejection returns in three months.
- Nothing is enacted before the confirmation gate.
