#!/usr/bin/env bash
# Design gate (.playbook/formats/design.md): fails on DESIGN.md lint errors,
# on contrast below WCAG AA, and on a theme that drifted from DESIGN.md.
# `npx --no` runs only the installed @google/design.md — never a download.
set -euo pipefail
design="${1:-DESIGN.md}"
theme="${2:-app/design-tokens.css}"
# shellcheck disable=SC2016 # the single-quoted block is JavaScript, not shell
npx --no -- design.md lint "$design" | node -e '
  const report = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const blocking = report.findings.filter((f) => f.severity === "error" || f.rule === "contrast-ratio");
  for (const f of blocking) console.error(`${f.rule}: ${f.message}`);
  process.exit(blocking.length ? 1 : 0);
'
npx --no -- design.md export --format css-tailwind "$design" | diff -u "$theme" - \
  || { echo "theme drift: regenerate $theme from $design"; exit 1; }
echo "design check passed"
