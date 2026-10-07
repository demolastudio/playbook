# DESIGN.md Format

> The project's design lock: one file, at the project root, that every agent
> reads before styling anything. It follows Google Labs' open DESIGN.md format
> (version `alpha`, CLI 0.4.0 in Oct 2026) — design tokens in YAML front matter,
> the reasons in prose. The spec itself comes from the tool: `npx design.md spec`.

## Setup

```bash
npm i -D -E @google/design.md@0.4.0
```

The format is alpha: pin it exactly and upgrade through the scheduled update PRs.

## Skeleton

Tokens are the normative values; prose sections appear in the spec's order
(Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components,
Do's and Don'ts) and any may be omitted. This example passes the lint gate:

```md
---
version: alpha
name: Glow Studio Booking
colors:
  primary: "#1F2A37"
  neutral: "#F7F5F2"
  surface: "#FFFFFF"
  accent: "#B4410C"
  on-accent: "#FFFFFF"
  success: "#15803D"
  error: "#B91C1C"
typography:
  heading: { fontFamily: Outfit, fontSize: 1.5rem, fontWeight: 600, lineHeight: 1.25 }
  body-md: { fontFamily: Inter, fontSize: 1rem, fontWeight: 400, lineHeight: 1.5 }
  label-sm: { fontFamily: Inter, fontSize: 0.875rem, fontWeight: 500, lineHeight: 1.4 }
rounded: { sm: 2px, md: 8px, full: 9999px }
spacing: { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 48px }
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 12px
---

## Overview

Direction: editorial. The calm confidence of a well-run clinic: precise, warm,
never clinical. Inspired by Swiss transit signage.

## Colors

Ink (`primary`) carries 60% of every screen, limestone (`neutral`) 30%, clay
(`accent`) 10% — the only interaction color. Semantic colors never double as brand hues.

## Do's and Don'ts

- Do extend the palette only with tints and shades of locked hues.
- Don't use gradients, glass, or cards inside cards. Motion stays under 200ms, no bounce.
```

## Rules

- **Overview names ONE committed direction and a motif.** The direction rules and the user's taste baseline live in `.playbook/playbooks/ui-ux/anti-ai-design.md` and `ui-ux/INDEX.md`; DESIGN.md refines them per project.
- **Components reference tokens** (`"{colors.accent}"`), never raw values, so the contrast check sees every pairing that ships.
- **The theme is generated, never hand-edited:** `npx design.md export --format css-tailwind DESIGN.md > app/design-tokens.css`, imported by the global stylesheet. A new token is a DESIGN.md edit plus a regenerate.
- **If DESIGN.md doesn't exist, ask the user for direction and motif** before styling — never invent taste (global rule 8). Design-skill output is input to it, never a rival file.

## Gate

The lint exits non-zero on errors (broken references) but only warns on WCAG
contrast, so the gate wraps it. Save as `scripts/check-design.sh`; it fails on
errors, on contrast below AA, and on a theme that drifted from DESIGN.md:

```bash
#!/usr/bin/env bash
set -euo pipefail
design="${1:-DESIGN.md}"
theme="${2:-app/design-tokens.css}"
npx design.md lint "$design" | node -e '
  const report = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const blocking = report.findings.filter((f) => f.severity === "error" || f.rule === "contrast-ratio");
  for (const f of blocking) console.error(`${f.rule}: ${f.message}`);
  process.exit(blocking.length ? 1 : 0);
'
npx design.md export --format css-tailwind "$design" | diff -u "$theme" - \
  || { echo "theme drift: regenerate $theme from $design"; exit 1; }
echo "design check passed"
```
