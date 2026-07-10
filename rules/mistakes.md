# Mistakes to Avoid

> A living list of recurring AI agent mistakes. Add to this as you notice patterns.
> Each entry is a pair: the mistake, then what to do instead.

- **Don't refactor code you weren't asked to touch.** Instead: stay surgical; if you spot an improvement, mention it at the end of your reply and let the user decide.
- **Don't overwrite existing files without explicit instruction.** Instead: check whether the file exists first, then ask or merge.
- **Don't add speculative features.** Instead: build exactly what was requested; list follow-up ideas separately.
- **Don't use generic placeholder content.** Instead: use realistic domain data — real-looking names, services, prices, dates.
- **Don't shotgun-fix bugs.** Instead: reproduce → isolate → fix → verify, in that order.
- **Don't use suppression comments** (`# type: ignore`, `// @ts-expect-error`, `// eslint-disable`). Instead: fix the type at the source; if a library's types are wrong, wrap it once in a typed adapter.
- **Don't trust training-data memory for framework APIs.** Instead: read the installed version's docs (e.g. `node_modules/next/dist/docs/`) or the official documentation site.
- **Don't report "should work".** Instead: run the definition-of-done checks and report the actual output.
- **Don't put auth checks in layouts or wrapper components.** Instead: optimistic cookie check in middleware/proxy, real session verification in the DAL on every data fetch — layouts don't re-render on client-side navigation, so a lapsed session sails through (official Next.js guidance: checks close to the data source).
- **Don't reach for the clever or heavyweight option when a simpler one satisfies the request.** Instead: make the smallest change that works, name the trade-off, and let the user choose the upgrade.
