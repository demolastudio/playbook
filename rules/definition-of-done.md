# Definition of Done

> A task is NOT complete until every gate below passes.
> Run the checks and read the output — never report "should work".

## Automated Gates

Run the commands from `.playbook/stacks/<stack>/checks.md` for the detected stack:

1. **Typecheck** passes with zero errors
2. **Lint** passes with zero suppressions added
3. **Tests** pass — behavior you changed has a test covering it

If no stack profile matches, find the project's equivalent commands (package.json scripts, Makefile, CI config) and run those.

## Review Gates

Before declaring done, confirm each of these against the actual diff:

- [ ] Every mutation is authenticated AND authorized server-side
- [ ] Every external input is validated at the boundary with a schema
- [ ] Every external side effect (charge, email, webhook, job) uses a business-derived idempotency key
- [ ] Error, loading, and empty states are handled
- [ ] No secrets or server-only values reach the client
- [ ] State transitions that matter to the business are audit-logged

## Reporting

State which gates ran and their real results. If a gate fails and cannot be fixed, say so explicitly — a failing gate reported honestly is acceptable; a skipped gate reported as passing is never acceptable.
