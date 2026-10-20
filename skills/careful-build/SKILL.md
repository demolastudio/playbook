---
name: careful-build
description: Use when building or changing code that touches payments, refunds, auth or permissions, booking or order state, or a database migration.
user-invocable: false
effort: high
---

# Careful Build

This change can lose money or data, so it gets more reasoning than routine work.

1. Read the routed chapter before writing code: `.playbook/playbooks/core/billing.md` and `.playbook/playbooks/core/idempotency.md` for money, `.playbook/playbooks/core/auth.md` for access, `.playbook/playbooks/<domain>/state-machines.md` for state, `.playbook/workflows/migrate.md` for a schema change.
2. Name the invariants the change must keep (an amount charged once, only the owner reads the record, no illegal state transition), and confirm them with the user when one is new.
3. Build with the test `.playbook/rules/definition-of-done.md` requires for this logic: an integration test against real Postgres, plus a parallel-request test when writes can race.
