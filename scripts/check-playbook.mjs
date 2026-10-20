// Checks the MAINTENANCE.md invariants a script can see: budgets, workflow
// and skill frontmatter, copied-skill sources, routing (flow.md, INDEX rows),
// links and cited paths, JSON, the freshness baselines, SHA-pinned actions,
// and executable shell scripts.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tracked = execFileSync("git", ["ls-files", "-s", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const staged = line.match(/^(\d{6}) \S+ \d\t(.+)$/);
    return staged ? { mode: staged[1], path: staged[2] } : { mode: null, path: line };
  })
  .filter((file) => existsSync(join(root, file.path)));
const paths = tracked.map((file) => file.path);
const read = (path) => readFileSync(join(root, path), "utf8");
const lineCount = (path) => read(path).split("\n").length - (read(path).endsWith("\n") ? 1 : 0);
const errors = [];
const fail = (path, message) => errors.push(`${path}: ${message}`);

const markdown = paths.filter((p) => p.endsWith(".md"));
const workflows = paths.filter((p) => /^workflows\/[^/]+\.md$/.test(p));
const chapters = markdown.filter((p) => /^(playbooks|stacks|formats|workflows)\//.test(p) && basename(p) !== "INDEX.md");

// Budgets
for (const p of paths.filter((p) => /^rules\/[^/]+\.md$/.test(p))) {
  if (lineCount(p) >= 50) fail(p, `rule file has ${lineCount(p)} lines (budget < 50)`);
}
for (const p of chapters) {
  if (lineCount(p) > 200) fail(p, `chapter has ${lineCount(p)} lines (hard max 200 — split it)`);
}

// Workflow frontmatter: single-line description, no double quotes
for (const p of workflows) {
  const frontmatter = read(p).match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  const description = frontmatter?.match(/^description: (.+)$/m)?.[1];
  if (!description || /^[>|]/.test(description)) fail(p, "frontmatter needs a single-line `description:`");
  else if (description.includes('"')) fail(p, "description contains a double quote");
  else if (description.includes(": ")) fail(p, "description contains \": \", which breaks YAML");
  const effort = frontmatter?.match(/^effort: (.+)$/m)?.[1];
  if (effort && !["low", "medium", "high", "xhigh", "max"].includes(effort)) fail(p, `effort must be low, medium, high, xhigh, or max (got ${effort})`);
}

// Skills: the folder name is the skill's name; a copied skill names its
// upstream commit and keeps the upstream license beside it
const skillDirs = [...new Set(paths.filter((p) => /^skills\/[^/]+\/SKILL\.md$/.test(p)).map((p) => p.split("/")[1]))];
for (const name of skillDirs) {
  const p = `skills/${name}/SKILL.md`;
  const frontmatter = read(p).match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (!/^[a-z0-9-]+$/.test(name)) fail(p, "skill folder names are lowercase letters, digits, and hyphens");
  if (frontmatter?.match(/^name: (.+)$/m)?.[1] !== name) fail(p, `frontmatter needs \`name: ${name}\` (the folder name)`);
  if (!/^description: ([^>|\s].*|[>|][-+]?\n[ \t]+\S.*)$/m.test(frontmatter ?? "")) fail(p, "frontmatter needs a `description:`");
  else if (/^description: [^>|].*: /m.test(frontmatter ?? "")) fail(p, "description contains \": \", which breaks YAML");
}
if (paths.includes("skills/sources.json")) {
  for (const source of JSON.parse(read("skills/sources.json")).sources ?? []) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(source.repo ?? "") || !/^[0-9a-f]{40}$/.test(source.commit ?? "")) fail("skills/sources.json", `each source needs \`repo: owner/name\` and a full 40-character \`commit\`: ${JSON.stringify(source.repo)}`);
    for (const name of Object.keys(source.skills ?? {})) {
      if (!skillDirs.includes(name)) fail("skills/sources.json", `lists ${name}, but skills/${name}/SKILL.md doesn't exist`);
      else if (!paths.includes(`skills/${name}/LICENSE`)) fail(`skills/${name}`, "a copied skill keeps its upstream LICENSE file");
    }
  }
}

// Routing: every workflow in flow.md, every chapter in its domain's INDEX.md
const flow = read("workflows/flow.md");
for (const p of workflows.filter((p) => p !== "workflows/flow.md")) {
  if (!flow.includes(`/${basename(p, ".md")}`)) fail("workflows/flow.md", `doesn't route to /${basename(p, ".md")}`);
}
for (const p of markdown.filter((p) => /^playbooks\/[^/]+\/[^/]+\.md$/.test(p) && basename(p) !== "INDEX.md")) {
  const index = join(dirname(p), "INDEX.md");
  if (!paths.includes(index) || !read(index).includes(basename(p))) fail(index, `has no row for ${basename(p)}`);
}

// Links and cited paths
const slug = (heading) => heading.toLowerCase().replace(/[`*]|(?<!\w)_+|_+(?!\w)/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s/g, "-");
const anchors = (path) => [...read(path).matchAll(/^#{1,6} (.+)$/gm)].map((m) => slug(m[1]));
const playbookPath = (cited) => {
  if (cited.startsWith(".playbook/")) return cited.slice(".playbook/".length);
  if (/^(rules|playbooks|stacks|workflows|formats)\//.test(cited)) return cited;
  if (/^(core|booking|dashboard|ecommerce|ui-ux)\/[^/]+\.md$/.test(cited)) return `playbooks/${cited}`;
  return null;
};
for (const p of markdown) {
  const text = read(p).replace(/^```[\s\S]*?^```/gm, "");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    if (p.startsWith("workflows/")) {
      fail(p, `relative link ${target} breaks once copied out — cite a .playbook/ path`);
      continue;
    }
    const [file, anchor] = target.split("#");
    const resolved = file ? relative(root, join(root, dirname(p), file)) : p;
    if (!existsSync(join(root, resolved))) fail(p, `broken link ${target}`);
    else if (anchor && resolved.endsWith(".md") && !anchors(resolved).includes(anchor)) fail(p, `no heading for #${anchor} in ${resolved}`);
  }
  if (p === "out-of-scope.md") continue; // names rejected and deferred paths on purpose
  for (const [, cited] of text.matchAll(/`([^`\s]+)`/g)) {
    if (/[<>*…{}$]|\.\.\./.test(cited)) continue;
    const resolved = playbookPath(cited.replace(/[#:].*$/, ""));
    if (resolved && !existsSync(join(root, resolved))) fail(p, `cites missing path ${cited}`);
  }
}

// JSON, freshness baselines, executable scripts
for (const p of paths.filter((p) => p.endsWith(".json"))) {
  try {
    JSON.parse(read(p));
  } catch (error) {
    fail(p, `invalid JSON: ${error.message}`);
  }
}
const packages = JSON.parse(read("scripts/tracked-packages.json"));
if (!/^\d{4}-\d{2}-\d{2}$/.test(packages.verifiedOn ?? "")) fail("scripts/tracked-packages.json", "verifiedOn must be YYYY-MM-DD");
for (const entry of packages.packages ?? []) {
  const complete = ["name", "tag", "verified", "affects"].every((key) => typeof entry[key] === "string" && entry[key]);
  if (!complete || !["exact", "major", "minor"].includes(entry.watch)) fail("scripts/tracked-packages.json", `incomplete entry ${JSON.stringify(entry)}`);
}
if (!/last diffed \d{4}-\d{2}-\d{2}/.test(read("MAINTENANCE.md"))) fail("MAINTENANCE.md", "upstream harvest needs `last diffed YYYY-MM-DD`");
for (const p of paths.filter((p) => /(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/.test(p))) {
  for (const [line] of read(p).matchAll(/^\s*-?\s*uses: .+$/gm)) {
    if (!/uses: (\.\/\S+|[\w.-]+\/[\w./-]+@[0-9a-f]{40} # v\S+)$/.test(line)) fail(p, `pin actions to a full commit SHA with a version comment: ${line.trim()}`);
  }
}
for (const file of tracked.filter((f) => f.path.endsWith(".sh"))) {
  if (file.mode && file.mode !== "100755") fail(file.path, "shell script isn't executable in git (git update-index --chmod=+x)");
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} playbook check(s) failed`);
  process.exit(1);
}
console.log(`playbook checks passed (${markdown.length} Markdown files)`);
