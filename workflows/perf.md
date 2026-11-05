---
description: Use to make pages faster on phones and slow networks without changing behavior - measure first, fix the biggest win, re-measure each phase
effort: high
---

# Perf

Make the app fast on a mid-range phone over slow 4G, without changing behavior or visuals. Budgets: `.playbook/playbooks/core/performance.md`. Stack mechanics: `.playbook/stacks/<stack>/` (its performance or caching chapter).

## Phase 1: Measure, Change Nothing

1. List the main pages from the router, plus every money journey (booking, checkout, payment).
2. For each page, record first-load JS from the production build output, then Lighthouse mobile at its default throttling (Slow 4G, slower CPU) and Lighthouse desktop: LCP, TBT, CLS.
3. List the 10 largest client-side dependencies and the files that import them.
4. Show one table, each number beside its budget, with the commands you ran. Then stop.

Done when every page has every number from a real run.

## Plan

Propose phases, biggest win first. Each phase names its pages, the number it should move, and by how much. A page already within budget gets no phase. Wait for approval (global rule 2).

## Fixes, Usual Order of Payoff

- **Ship less JS.** Move `"use client"` down to the smallest interactive leaf, keep data fetching on the server, and load heavy widgets (charts, maps, date pickers, rich editors) on interaction.
- **Dependencies.** Remove or replace one only after the user approves the list and its replacements. A date, money, or timezone library change needs the tests that cover it green before and after.
- **Images.** The framework image component, explicit dimensions, and a `sizes` value that matches the layout at 375px and on desktop. Preload the LCP image; lazy-load the rest.
- **Fonts, third-party scripts, and page caching** per the budgets and the stack chapter.
- **Memoization** (`memo`, `useMemo`, `useCallback`) only where a profile shows a slow re-render, never as a sweep.

## Slow Networks

- Every submit button is disabled while its action is pending, and the server side stays idempotent (`.playbook/playbooks/core/idempotency.md`): slow networks cause double taps and retries.
- Every route has a loading state that matches its layout.
- Run one money journey end to end with DevTools set to Slow 4G.

## Each Phase

Build it, run the gates in `.playbook/rules/definition-of-done.md`, re-measure the pages it targets, and show before → after. A phase that moves no number is reverted.

## Rules

- No behavior or visual change without the user.
- Never claim a speedup without before and after numbers from real runs.
- Stop when every page meets its budget.
