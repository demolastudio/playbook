---
description: Use when a bug, error, flake, or regression needs diagnosing
---

# Debug

A discipline for real bugs. The phases run in order — do NOT skip ahead.

## Phase 1: Build a Tight Feedback Loop

**This is the skill — everything after it is mechanical.** A tight loop is one command that goes red on THIS bug and green when it's fixed. With one, the bug is 90% solved; without one, no amount of reading code will save you.

Ways to construct one, in rough order: a failing test at the nearest seam; a curl against the dev server; a CLI run diffed against known-good output; a headless browser script; replaying a captured payload through the code path in isolation.

The loop is tight when ALL four hold:

- [ ] **Red-capable** — it asserts the user's exact symptom, not just "runs without erroring"
- [ ] **Deterministic** — same verdict every run (flaky bugs: loop the trigger until the reproduction rate is high enough to debug against)
- [ ] **Fast** — seconds, not minutes
- [ ] **Agent-runnable** — you can run it unattended

**No red-capable command, no Phase 2.** If you catch yourself reading code to build a theory before this command exists, stop — that is the exact failure this workflow prevents. If you genuinely cannot build a loop, say so, list what you tried, and ask the user for a repro environment or captured artifact.

## Phase 2: Reproduce and Minimise

Run the loop; watch it go red on the failure the USER described — a nearby different failure means the wrong bug. Then shrink the repro to the smallest scenario that still goes red, cutting one element at a time and re-running after each cut. Done when every remaining element is load-bearing.

## Phase 3: Hypothesise

Generate **3–5 ranked hypotheses** before testing any — a single hypothesis anchors on the first plausible idea. Each must be falsifiable:

> "If X is the cause, then changing Y will make the bug disappear."

A hypothesis with no testable prediction is a vibe — discard or sharpen it. Show the ranked list to the user before testing; they often re-rank it instantly. Don't block if they're away.

## Phase 4: Instrument

Each probe maps to one prediction from Phase 3. Change one variable at a time. Prefer a debugger breakpoint over logs; prefer targeted logs over "log everything and grep." Tag every debug log with one unique prefix (e.g. `[DEBUG-a4f2]`) so cleanup is a single grep.

## Phase 5: Fix and Regression-Test

1. Turn the minimised repro into a failing test at a correct seam — one that exercises the real bug pattern. If no correct seam exists, that itself is a finding: document it instead of writing a false-confidence test.
2. Watch it fail → apply the fix (root cause only, surgical) → watch it pass.
3. Re-run the Phase 1 loop against the original, un-minimised scenario.

## Phase 6: Cleanup

- [ ] Original repro no longer reproduces
- [ ] Regression test passes (or the missing seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed — grep the prefix
- [ ] The winning hypothesis is stated in the commit message
- [ ] Definition-of-done gates pass (`.playbook/rules/definition-of-done.md`)

Then ask: what would have prevented this bug? If the answer is architectural (no good seam, tangled callers), tell the user — after the fix is in, when you know the most.

## Rules

- NEVER hypothesize before the loop goes red — reproduce first, always.
- NEVER apply multiple fixes at once. If the top hypothesis dies, return to the ranked list, not to guessing.
- NEVER declare fixed without re-running the original repro.
