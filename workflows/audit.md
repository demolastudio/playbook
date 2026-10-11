---
description: Use for a security, cost, payments, and reliability audit of the whole codebase, periodically or before launch
effort: xhigh
---

# Audit

Read `.playbook/stacks/<stack>/STACK.md` first: it names the concrete tools each check refers to.

## Method

1. Send one read-only subagent per group below, in parallel. Without a subagent tool, check the groups one at a time. Subagents never edit.
2. Each finding names its file and line, or the dashboard it is in. For a secret, report only where it is, never its value.
3. Merge the findings into one list, Critical (security, money) → High → Medium, and show it to the user. Change nothing until the user confirms.
4. After confirmation, make every fix yourself, so no two agents edit the same file.
5. For work only the user can do in a dashboard (rotate a key, turn on 2FA, set a spending cap), give numbered steps. For values only the user knows (a cap, a daily AI limit), ask; never invent one.
6. Never rewrite git history, never touch production data, and run payments only in test mode.
7. Finish with what changed and what is left for the user.

## Groups

**1. Keys and access**
- No secret in source, in the built client bundle (search the build output for key prefixes such as `sk_`), or in git history
- Every endpoint and Server Action checks the session and ownership on the server: every query that reads or writes a record filters by owner (BOLA)
- Input is validated in three layers: client → server schema (Zod / Pydantic / DTO) → database constraints
- Session cookies are `httpOnly`, `secure`, `sameSite=lax`; mutations have CSRF protection (Next.js Server Actions have it built in; API routes need tokens)
- The upload bucket is private; files are shared through signed URLs that expire
- No secret reaches the logs (`core/monitoring.md`); no suppression comments (`@ts-expect-error`, `eslint-disable`, `# type: ignore`)

**2. Cost abuse**
- The stack's rate limiter covers sign-up, login, and verification-code endpoints
- Paid AI, SMS, and email calls have a per-user daily cap, and the provider has a spending cap or alert (dashboard)
- Uploads have a size limit and a file-type allowlist, checked on the server
- Sign-up has a CAPTCHA, and free credits wait until the email is verified (`core/security.md`)

**3. Payments**
- Every payment webhook verifies its signature, and a repeated event is recorded once (`core/idempotency.md`)
- Every amount charged comes from the server, never from the client
- In test mode, a refund, a canceled subscription, and a failed charge each leave the app's status matching the provider's
- Access ends on time when a trial ends or a subscription lapses

**4. Failures**
- Error monitoring reports production errors (`core/monitoring.md`), and failed scheduled jobs alert someone
- The database is backed up daily, and one backup was restored into a fresh database to prove it works
- An external uptime monitor alerts when the site is down
- An admin can block an abusive account in one action

**5. Performance**
- No unnecessary client-side JavaScript (Next.js: prefer Server Components)
- Indexes on frequently queried columns; no N+1 queries
- Images optimized and sized (Next.js: `next/image`); cacheable responses cached; a Content Security Policy is set

## Rules

- Check every file, not a sample
- Payments and keys get the most scrutiny: a miss there costs money or data
