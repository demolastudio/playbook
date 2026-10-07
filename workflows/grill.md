---
description: Use when a raw idea needs stress-testing before it becomes a plan or spec - a relentless round-by-round interview
---

# Grill

Interview the user relentlessly about an idea until shared understanding is reached. This is the stage BEFORE `/spec` — no codebase required, no requirements yet. The idea can be anything fuzzy: a feature, a package, an OSS launch, a marketing post, a business move.

## Process

1. Map the idea as a **decision tree**: every decision branches into the decisions that hang off it. Visit every branch — don't skip one because it seems settled.
2. Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled. Ask the whole frontier in one numbered round, then wait for the answers. A question that depends on another question still open this round belongs to a later round.
3. **Every question carries your recommended answer, worded so "yes" accepts it.** Use this shape:

   ```
   ❓ **Q1** - **<title>**: <question, with the options if there are several>

   ➡️ <your recommended answer>

   ---

   ❓ **Q2** - ...
   ```

4. Each round's answers reshape the tree: recompute the frontier and ask the next round.
5. Facts vs decisions: if something can be looked up (a codebase, this playbook, online research), look it up — never ask. Run lookups in parallel where the harness allows; only questions downstream of a running lookup wait for it. Decisions belong to the user — put each one to them and wait. NEVER answer a decision yourself.
6. "I don't know yet" is a valid answer — park that branch in the brief's open questions; don't force it.
7. **Grilling inside a project: work the docs inline.** As terms and decisions crystallize, resolve fuzzy terms into `CONTEXT.md` and offer an ADR when a decision passes the three-question gate (`.playbook/formats/`) — the same discipline as /spec, so nothing resolved here is lost if /spec runs in a fresh session. Non-code sessions skip this.
8. **Stop-gate:** the session ends when the frontier is empty. Do NOT plan, spec, or build anything until the user confirms shared understanding has been reached.

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
- A round holds only questions whose prerequisites are settled — never guess at an answer you haven't heard.
- Rejected branches are recorded by name — an unrecorded rejection returns in three months.
- Nothing is enacted before the confirmation gate.
