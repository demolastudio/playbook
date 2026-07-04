# ADR Format

> Architecture Decision Records — durable memory of decisions that would
> otherwise be re-litigated or accidentally "fixed" by a future session.
> They live in the project at `docs/adr/NNNN-slug.md`, numbered sequentially.
> Create `docs/adr/` lazily — only when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1–3 sentences: the context, what was decided, and why.}
```

That's the whole format. An ADR can be a single paragraph — the value is
recording *that* a decision was made and *why*, not filling out sections.
Add `Status`, `Considered Options`, or `Consequences` only when they carry
real information.

## The Three-Question Gate

Write an ADR only when ALL three are true:

1. **Hard to reverse** — changing your mind later has a meaningful cost
2. **Surprising without context** — a future reader would wonder "why did they do it this way?"
3. **A real trade-off** — genuine alternatives existed and one was chosen for specific reasons

Any question fails → no ADR. Easy to reverse: you'll just reverse it.
Not surprising: nobody will wonder. No alternative: nothing to record.

## What Qualifies

- **Architectural shape** — "slots are materialized on a rolling window, not computed per request"
- **Technology choices with lock-in** — database, auth provider, payment provider; not every library
- **Deliberate deviations from the obvious path** — anything a reasonable reader would assume the opposite of; this is what stops the next agent from "fixing" an intentional choice
- **Constraints invisible in the code** — compliance limits, partner API contracts
- **Non-obvious rejections** — the alternative you considered and rejected for subtle reasons, so it doesn't get re-proposed in six months
