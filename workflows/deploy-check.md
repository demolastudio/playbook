---
description: Use before deploying to production to verify environment, database, and security requirements
---

# Deploy Check

When triggered, verify all deployment requirements are met.
Run `.playbook/rules/definition-of-done.md` first — deploy-check assumes those
gates already pass and adds production-only concerns. Read
`.playbook/stacks/<stack>/checks.md` for the stack's concrete commands.

## Checklist

### Environment
- [ ] All required env vars are set (check `.env.example` against production)
- [ ] No `.env` files committed to git
- [ ] Secrets are in a secrets manager, not plain text

### Database
- [ ] All migrations are applied
- [ ] No pending schema changes
- [ ] Indexes exist on frequently queried columns
- [ ] Seed data is not present in production

### Code Quality
- [ ] Production build passes with zero errors (stack build command from `checks.md`)
- [ ] No `TODO`, `FIXME`, or `HACK` in production code
- [ ] No debug logging (`console.log`, `print`) in production code
- [ ] No suppression comments (`@ts-expect-error`, `eslint-disable`, `# type: ignore`)
- [ ] No hardcoded localhost URLs

### Security
- [ ] Rate-limiting middleware is configured (Next.js: Arcjet in `middleware.ts`)
- [ ] CSRF protection is active on all mutations
- [ ] Session cookies have correct flags
- [ ] CSP headers are configured
- [ ] Rate limiting is active on auth endpoints

### Testing
- [ ] All tests pass
- [ ] Critical paths have test coverage (auth, payments, booking flow)

## Output

Present as a pass/fail checklist with action items for any failures.
