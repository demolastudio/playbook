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
- [ ] The stack profile's rate limiter is configured (vinext-cloudflare: Better Auth database limits + Workers Rate Limiting binding; nextjs: Arcjet in `proxy.ts`)
- [ ] CSRF protection is active on all mutations
- [ ] Session cookies have correct flags
- [ ] CSP headers are configured

### Launch Day
- [ ] Debug mode is off; test accounts and test data are deleted from production
- [ ] Payments are live: live keys and the live webhook signing secret are set in production
- [ ] `pnpm audit --prod` reports no known vulnerabilities, or each one is upgraded
- [ ] User-only, in dashboards (give the user the steps): two-factor auth on the payment provider, hosting, and database; domain auto-renew on; spending caps or alerts on paid AI, SMS, and email

### Pages
- [ ] Every page has a title, a description, and a favicon
- [ ] Every page has one main action, and no placeholder text remains
- [ ] Sign-up and checkout (or booking) work end to end with only a keyboard; no button does nothing and no link is broken

### Testing
- [ ] All tests pass
- [ ] Critical paths have test coverage (auth, payments, booking flow)

## Output

Present as a pass/fail checklist with action items for any failures.
