---
description: Security and performance audit of the current codebase
---

# Audit

When triggered, perform a full audit against the playbook standards.
First read `.playbook/stacks/<stack>/STACK.md` for the project's stack — it names
the concrete tools each check refers to (examples below use the Next.js stack).

## Security Checks

1. **BOLA** — Every query that reads/updates/deletes a record includes an ownership filter
2. **Rate limiting** — middleware is installed and active (Next.js: Arcjet in `middleware.ts`)
3. **CSRF** — All mutation endpoints have CSRF protection (Next.js: Server Actions built-in, API routes need tokens)
4. **Cookies** — All session cookies are `httpOnly`, `secure`, `sameSite=lax`
5. **Input validation** — Three layers: client → server schema (Zod / Pydantic / DTO) → database constraints
6. **Secrets** — No hardcoded secrets in source code, all in env vars
7. **CSP headers** — Content Security Policy is configured
8. **Suppression comments** — No `// @ts-expect-error`, `// eslint-disable`, `# type: ignore`

## Performance Checks

1. **Payload size** — No unnecessary client-side JavaScript (Next.js: prefer Server Components)
2. **Database** — Indexes on frequently queried columns, no N+1 queries
3. **Images** — Optimized and properly sized (Next.js: `next/image`)
4. **Caching** — Static or cacheable responses where possible (Next.js: ISR/static generation)

## Output

Present findings as a table:

| Category | Check | Status | Action Needed |
|---|---|---|---|
| Security | BOLA prevention | ✅/❌ | Description |
| ... | ... | ... | ... |

## Rules

- Check every file, not just a sample
- Reference specific file paths and line numbers for failures
- Prioritize: Critical (security) → High (performance) → Medium (best practices)
