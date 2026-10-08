## Deployment Checklist

> Sources: [Vercel Deployment Docs](https://vercel.com/docs/deployments),
> [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/headers)
> The principles are universal; code examples use the Next.js/Vercel stack.
> The pipeline that runs BEFORE deploy (hooks, CI gates): [ci-cd.md](./ci-cd.md).

---

### Pre-Deploy: Environment Validation

Every secret and config value must be validated at build time. If a variable is missing or malformed, the build fails with a clear error — not a cryptic runtime crash.

```typescript
// lib/env.ts — Import this from your app entry points
import { z } from "zod"

const envSchema = z.object({
  // Database
  DATABASE_URL:            z.url(),
  DIRECT_DATABASE_URL:     z.url(),

  // Auth
  BETTER_AUTH_SECRET:      z.string().min(32),

  // Stripe
  STRIPE_SECRET_KEY:       z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET:   z.string().startsWith("whsec_"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),

  // Email
  RESEND_API_KEY:          z.string().min(1),

  // Redis
  UPSTASH_REDIS_REST_URL:  z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Inngest
  INNGEST_SIGNING_KEY:     z.string().optional(), // Optional in dev
  INNGEST_EVENT_KEY:       z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL:     z.url(),
})

export const env = envSchema.parse(process.env)
// If ANY variable is missing or malformed → build fails immediately
```

> **Rule:** Variables prefixed `NEXT_PUBLIC_` are inlined into client JS at build time.
> They cannot be changed after deployment without a rebuild. Never prefix secrets.

---

### Security Headers and CSP

The stack's `proxy.ts` template (`stacks/nextjs/templates/proxy.ts`) sets the baseline on every response: HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and a structural CSP (`frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`). That CSP restricts no scripts, so it is safe on pages served from cache.

A script-restricting CSP needs a per-request nonce, and a nonce disables static rendering, ISR, Partial Prerendering, and Workers Cache page caching. Add one only to apps whose pages are all dynamic, following the Next.js CSP guide: generate the nonce with `crypto.randomUUID()`, and set the CSP header on the **request** (`NextResponse.next({ request: { headers } })`) as well as the response — the framework reads the nonce from the request.

**Rules:**
- Never `unsafe-eval`; never `unsafe-inline` for scripts — nonces instead
- Stripe Elements need `script-src https://js.stripe.com` and `frame-src https://js.stripe.com`
- Roll out a new CSP as `Content-Security-Policy-Report-Only` first, then enforce
- After deploy, check [securityheaders.com](https://securityheaders.com)

---

### Deployment Strategy

#### Preview Deployments
- Vercel creates a preview deployment for every PR automatically
- Treat previews as your staging environment
- Run E2E tests against preview URLs before merging to main
- Enable deployment protection (Vercel Authentication) so previews aren't publicly accessible

#### Production Deployment
- Production deploys happen on push to `main` branch (or your configured production branch)
- **Never** deploy to production on Fridays or before holidays
- Monitor error rates for 15 minutes after each deploy

#### Rollback Strategy
```bash
# Instant rollback — re-assigns production domain to a previous deployment
vercel rollback <deployment-url>
```

- Vercel keeps all previous deployments accessible by URL
- Rollback is instant (< 1 second) — no rebuild required
- If a deploy breaks production, rollback first, then investigate
- Consider a "canary" approach for high-risk changes: deploy to a custom domain first, verify, then promote

---

### Go-Live Checklist

| Category          | Item                                                    | Status |
| ----------------- | ------------------------------------------------------- | ------ |
| **Env**           | All secrets in Vercel dashboard (not committed)         | ☐      |
| **Env**           | `NEXT_PUBLIC_` only on non-secret values                | ☐      |
| **Env**           | Zod validation of all env vars at build time            | ☐      |
| **DB**            | Pooled connection string for app, direct for migrations | ☐      |
| **DB**            | Database backup schedule confirmed                      | ☐      |
| **DNS**           | SPF + DKIM + DMARC records verified                     | ☐      |
| **DNS**           | Custom domain configured + SSL verified                 | ☐      |
| **Stripe**        | Webhook endpoint registered + signature verified        | ☐      |
| **Stripe**        | Live mode keys (not test keys)                          | ☐      |
| **Stripe**        | Test a real charge end-to-end in live mode              | ☐      |
| **Auth**          | `BETTER_AUTH_SECRET` is unique, ≥ 32 chars              | ☐      |
| **Auth**          | Owner account seeded in production DB                   | ☐      |
| **Headers**       | Security headers applied and tested (A+ on securityheaders.com) | ☐ |
| **Headers**       | CSP configured and tested in report-only mode           | ☐      |
| **Monitoring**    | Error tracking (Sentry) connected to production         | ☐      |
| **Monitoring**    | Log drains configured                                   | ☐      |
| **Performance**   | Lighthouse CI score ≥ 90 on public pages                | ☐      |
| **Accessibility** | axe scan: 0 critical/serious violations                 | ☐      |
| **SEO**           | `robots.txt` and `sitemap.xml` verified                 | ☐      |
| **SEO**           | `<title>` and `<meta description>` on all public pages  | ☐      |
| **Email**         | Test email delivery from production domain              | ☐      |
| **Inngest**       | All functions registered and test events processed      | ☐      |
| **Backup**        | Rollback procedure documented and tested                | ☐      |

---

### Post-Deploy Verification

Run these checks within 15 minutes of every production deploy:

1. **Public booking flow** — complete a test booking end-to-end
2. **Stripe webhook** — trigger a test event and verify processing
3. **Email delivery** — verify confirmation email arrives
4. **Portal access** — verify portal token loads dashboard
5. **Owner login** — verify auth + dashboard loads
6. **Error tracking** — check Sentry for new errors (should be zero)
