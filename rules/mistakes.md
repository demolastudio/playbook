# Mistakes to Avoid

> A living list of recurring AI agent mistakes. Add to this as you notice patterns.
> Each entry is a pair: the mistake, then what to do instead.

- **Don't use generic placeholder content.** Instead: use realistic domain data — real-looking names, services, prices, dates.
- **Don't shotgun-fix bugs.** Instead: reproduce → isolate → fix → verify, in that order.
- **Don't use suppression comments** (`# type: ignore`, `// @ts-expect-error`, `// eslint-disable`). Instead: fix the type at the source; if a library's types are wrong, wrap it once in a typed adapter.
