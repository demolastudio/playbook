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

At the start of every project, create a `DESIGN.md` in the project root in the format of `.playbook/formats/design.md`. It is the single source of truth for visual decisions: the agent reads it before styling anything, the Tailwind theme is generated from it, and its gate fails on broken token references, contrast below WCAG AA, and a theme that drifted from it. The format file also holds the lock's rules (tokens only, tints and shades only, ask before inventing taste).

---

### Rules

- **No decision = slop.** Commit to a direction in DESIGN.md before the first component.
- **Typographic hierarchy is the fastest escape** — decisive size and weight contrast reads as designed; uniform type reads as generated.
- **One accent color, working hard.** If the accent appears on more than ~10% of the screen, it's not an accent.
- **Specificity beats vibes** — "Swiss editorial, 2px radius, ink-on-paper palette" produces better output than "modern and clean".
- **The Design Taste list in INDEX.md is the user's baseline** — DESIGN.md refines it per project, never contradicts it.
