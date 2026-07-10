## Anti-AI Design

> Why AI-generated UIs all look the same, and the process that prevents it.
> Read this BEFORE styling anything new.

### The Root Cause

A model predicts the most probable output. For visual design, "most probable" is the statistical average of millions of templates — safe, universal, forgettable. The slop look is not a bug; it's what happens when **no design decision was made**. The fix is always the same: commit to a direction and lock it in writing before generating any UI.

---

### Slop Patterns → What to Do Instead

| Slop pattern | Instead |
| ------------ | ------- |
| Purple-to-blue gradient everything | One accent color doing real work (CTAs, active states, key data) — nowhere else |
| Same border-radius on every element | A radius scale with intent: sharp for data/tables, rounded for interactive, pill only for tags |
| Three identical feature cards in a row | Vary card weight: one primary (larger, illustrated), supporting ones smaller |
| Everything centered | Left-aligned text blocks; asymmetric layouts; centered only for single-focus moments |
| Emoji as icons (🚀 ✨ 💡) | A single icon set (Lucide), one stroke weight, used sparingly |
| Gradient blob / mesh backgrounds | Texture with restraint: subtle grain, grid lines, or solid color blocks |
| One font, one weight, one size everywhere | Inter/Outfit (per Design Taste) with a deliberate type scale — strong weight and size contrast between headings and body |
| Identical padding on every section | A deliberate spacing rhythm: hero breathes, dense sections compress |
| Generic microcopy ("Empower your workflow") | Concrete language about what the product actually does |
| Every surface glassmorphic | Glass as accent on 1–2 surface types max |

---

### The Fix: DESIGN.md Token Lock

At the start of every project, create a `DESIGN.md` in the project root. It is the single source of truth for visual decisions — the agent reads it before styling anything, and never deviates from it.

```markdown
# Design — [Project Name]

## Direction
[ONE committed direction: editorial / brutalist / industrial-mono /
 soft-organic / dense-terminal. Name it. Everything follows from it.]

## Motif
[2–3 sentences: the feeling the product should evoke, one real-world
 inspiration. e.g. "Calm confidence of a well-run clinic — precise,
 warm, never clinical. Inspired by Swiss transit signage."]

## Tokens (locked)
- Palette: [dominant 60% / neutral 30% / accent 10% — exact HSL values]
- Semantic colors: success / warning / error / info — separate from brand hues
- Type: Inter or Outfit (per Design Taste); heading weights + scale, [mono] for data
- Type scale: [e.g. 1.25 ratio from 14px base]
- Radius scale: [e.g. 2px data / 8px interactive / full pills]
- Spacing unit: [e.g. 4px base grid]
- Motion: [e.g. 200ms ease-out, no bounce]

## Never
[Project-specific bans, e.g. "no gradients", "no cards inside cards"]
```

**Rules for the lock:**

- Extend the palette only via tints/shades of the locked hues — never new hues
- New components use existing tokens; a new token requires updating DESIGN.md first
- If DESIGN.md doesn't exist yet, ask the user for direction + motif before styling — never invent taste (see `rules/global-rules.md` rule 8)
- Design-skill output (e.g. ui-ux-pro-max's MASTER.md) is *input* to DESIGN.md — merge what survives the taste filter; one lock per project (see `recommended-skills.md` precedence)

---

### Rules

- **No decision = slop.** Commit to a direction in DESIGN.md before the first component.
- **Typographic hierarchy is the fastest escape** — decisive size and weight contrast reads as designed; uniform type reads as generated.
- **One accent color, working hard.** If the accent appears on more than ~10% of the screen, it's not an accent.
- **Specificity beats vibes** — "Swiss editorial, 2px radius, ink-on-paper palette" produces better output than "modern and clean".
- **The Design Taste list in INDEX.md is the user's baseline** — DESIGN.md refines it per project, never contradicts it.
