## Monitoring & Observability

> **Sources:** [OpenTelemetry docs](https://opentelemetry.io/docs/),
> [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/),
> [Vercel Observability](https://vercel.com/docs/observability)

---

### The Three Pillars

Production observability requires correlating **Logs, Metrics, and Traces** using a shared context. Isolated tools create blind spots.

| Pillar | What It Answers | Tool |
| ------ | --------------- | ---- |
| **Logs** | "What happened?" | Structured JSON logs (`lib/logger.ts`) |
| **Metrics** | "How much / how often?" | Counters, gauges, histograms |
| **Traces** | "Where did the time go?" | Distributed traces (OpenTelemetry → Sentry) |

---

### Structured Logging

Every log entry is one queryable JSON object, never free text. The logger is the stack's `lib/logger.ts` template (`stacks/nextjs/templates/logger.ts`): JSON through `console`, which both Workers Logs and Vercel index by field. `defineAction` and `withContext` attach `requestId`, `action`, and `userId` to every line written during a request, so call sites add only the event's own fields:

```typescript
logger.info({ event: "booking.created", bookingId, amountInCents: 18500 }, "booking created")
logger.error({ event: "payment.failed", bookingId, declineCode }, "charge failed")
```

**Rules:**
- Always include `event` (machine-readable action name) and the entity IDs involved
- Never log PII in plain text (email, phone, card numbers) — log IDs that can be looked up
- Expected business failures (`appError`) log as `warn`; `error` is reserved for what someone must fix
- No Pino on Workers: it needs `worker_threads`, and Workers prefixes stdout lines, so its output isn't indexed as JSON

---

### OpenTelemetry Integration

```typescript
// instrumentation.ts — Vercel zero-config (Next.js stack example)
import { registerOTel } from "@vercel/otel"

export const register = () => {
  registerOTel({ serviceName: "booking-web" })
}
```

Off Vercel: initialise `@opentelemetry/sdk-node` with auto-instrumentations in the same `instrumentation.ts` hook, exporting to Sentry/Jaeger/SigNoz.

---

### Error Tracking (Sentry)

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,   // 10% of transactions in production
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,

  beforeSend(event) {
    // Scrub PII before it leaves the server
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    return event
  },

  // Ignore noisy, non-actionable errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
})
```

**Sentry + OTel integration:**
- Sentry can consume OpenTelemetry data — jump from an error to the full distributed trace
- See exactly which database query or external API call caused the failure
- Don't choose between Sentry and OTel — use both together

---

### Service Level Objectives (SLOs)

Don't monitor "everything." Focus on what impacts users.

| SLO                      | Target  | SLI (How to Measure)                               |
| ------------------------ | ------- | -------------------------------------------------- |
| **Booking success rate** | ≥ 99.5% | `(successful bookings) / (booking attempts)`       |
| **Payment processing**   | ≥ 99.9% | `(charges succeeded) / (charges attempted)`        |
| **API latency (p95)**    | ≤ 500ms | Server Actions + Route Handler response time       |
| **Uptime**               | ≥ 99.9% | Health check endpoint (`/api/health`)              |
| **Email delivery**       | ≥ 98%   | `(delivered) / (sent)` — track via Resend webhooks |

#### Error Budgets

Instead of alerting on absolute thresholds, use **error budgets**:

- SLO of 99.9% uptime = **43 minutes of allowed downtime per month**
- Track how much of the budget has been consumed
- Alert when the **burn rate** exceeds normal — e.g., "We're consuming error budget 10x faster than sustainable"
- This prevents alert fatigue from one-off blips while catching real incidents

---

### What to Alert On (Not Everything)

| Alert                          | Threshold          | Action                                          |
| ------------------------------ | ------------------ | ----------------------------------------------- |
| **Payment failure spike**      | > 5% in 10 min     | Check Stripe status page + review decline codes |
| **5xx error rate**             | > 1% in 5 min      | Investigate immediately                         |
| **Webhook delivery failures**  | Any 3 consecutive  | Check endpoint + Stripe dashboard               |
| **Queue backlog**              | > 100 pending jobs  | Scale workers or investigate stuck jobs         |
| **Database connection errors** | Any                | Check Neon status, connection pool exhaustion   |
| **Error budget burn rate**     | > 5x normal        | Slow deployments, investigate root cause        |

**Rules:**
- Every alert must have a **runbook** — a documented action to take
- Never alert on things you can't act on
- Route critical alerts to on-call (PagerDuty, Opsgenie). Route warnings to Slack/email.
- Review and prune alert rules monthly — unused alerts become noise

---

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from "@/lib/db"

export const GET = async () => {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    })
  } catch (error) {
    return Response.json(
      { status: "error", message: "Database unreachable" },
      { status: 503 }
    )
  }
}
```

> **Note:** On serverless Postgres free tiers, poll health at 5-minute intervals — each call wakes the database and burns compute hours.

---

### Monitoring Checklist by Phase

| Phase | What to Set Up | Tool |
| ----- | ------------- | ---- |
| **Dev** | Structured logging (`lib/logger.ts`) | Console output |
| **Preview** | Error tracking | Sentry (dev DSN) |
| **Production** | Error tracking + tracing | Sentry + OTel |
| **Production** | Uptime monitoring | Better Stack / UptimeRobot |
| **Production** | Performance (RUM) | Vercel Speed Insights |
| **Production** | Log aggregation | Vercel Log Drains → Datadog/Axiom |
| **Scale** | Custom dashboards | Grafana + Prometheus |

---

### Cost-Conscious Monitoring

Free tiers (Sentry 5K errors/mo, Better Stack 5 monitors, Vercel Analytics on Hobby) cover demos and portfolios. Production with paying SME clients: paid Sentry for retention + alerting, plus Better Stack or Axiom for log retention — monitoring is part of what the client is paying for.
