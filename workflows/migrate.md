---
description: Use before a risky database change - a rename, a type change, NOT NULL on an existing column, a drop, or moving data - so no step loses data or breaks running code
effort: xhigh
---

# Migrate

Additive changes (a new table, a new nullable column, a new index) go through the normal flow. This workflow is for changes that can lose data or break the code already running. The rules are in `.playbook/playbooks/core/database.md` (Schema Evolution); this is the procedure.

## 1. Plan: Expand → Migrate → Contract

Each step ships on its own, and each one works with the code running beside it:

1. **Expand** — add the new column or table, nullable or with a default.
2. **Write both** — deploy code that writes the old and the new.
3. **Backfill** — copy existing rows in batches, re-runnable without harm. Verify the row counts, and that money and booking values match row for row.
4. **Switch reads** — deploy code that reads the new column.
5. **Contract** — stop writing the old column, then drop it in a later deploy.

Present the plan: each step's migration and code change. Wait for approval.

## 2. Test on a Branch

- Run each step's migration on a database branch first. With Neon, the `neon-postgres-branches` skill creates one: a normal branch for testing with real data, a schema-only branch when the data is sensitive.
- Run the integration tests against that branch.
- Time each migration there. One that locks a busy table for long needs a different approach.

## 3. Ship Each Step

- Take a backup or a restore point right before each production step.
- Apply it with the project's `db:migrate` script (`.playbook/stacks/<stack>/checks.md`).
- Production changes are the user's decision: give the command and wait for a yes.
- If a step goes wrong, deploy the previous code. The expanded schema still supports it.

## Rules

- Never drop or rename a column in the deploy that stops using it.
- Never switch reads before the backfill is verified.
