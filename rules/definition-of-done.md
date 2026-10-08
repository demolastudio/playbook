# Definition of Done

> A task is NOT complete until every gate below passes.

## Automated Gates

Run the commands from `.playbook/stacks/<stack>/checks.md` for the detected stack:

1. **Typecheck** passes with zero errors
2. **Lint** passes with zero suppressions added
3. **Tests** pass, and the diff carries the test its change requires (`.playbook/playbooks/core/testing.md`):
   - Money, booking state, capacity, idempotency, permission, or webhook logic → integration test against real Postgres; writes that can race → a parallel-request test
   - Pure money calculation → table-driven test at the pricing function, expected values worked by hand
   - Bug fix → a test that fails before the fix
   - A money journey no integration test can see → a Playwright spec
   - An integration a fake cannot prove → a run against the provider's sandbox (test-mode keys only)
   - Copy, styling, layout, config, dependency bumps, plain CRUD, or refactors under existing tests → no new test; report "no test: <reason>"
4. **Design** passes (`scripts/check-design.sh`, per `.playbook/formats/design.md`) when the project has a `DESIGN.md`

If no stack profile matches, find the project's equivalent commands (package.json scripts, Makefile, CI config) and run those.

## Review Gates

Before declaring done, confirm each of these against the actual diff:

- [ ] Every mutation is authenticated AND authorized server-side
- [ ] Every external input is validated at the boundary with a schema
- [ ] Every external side effect (charge, email, webhook, job) uses a business-derived idempotency key
- [ ] Error, loading, and empty states are handled
- [ ] No secrets or server-only values reach the client
- [ ] State transitions that matter to the business are audit-logged
- [ ] UI changes: verified at 375px width and desktop (see `playbooks/ui-ux/responsive.md`)

## Reporting

State which gates ran and their real results. If a gate fails and cannot be fixed, say so explicitly — a failing gate reported honestly is acceptable; a skipped gate reported as passing is never acceptable.
