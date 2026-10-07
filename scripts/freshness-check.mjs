import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const tracked = JSON.parse(readFileSync(new URL("scripts/tracked-packages.json", root), "utf8"));
const maintenance = readFileSync(new URL("MAINTENANCE.md", root), "utf8");
const reportPath = process.argv[2] ?? "freshness-report.md";
const upstreamUrl = "https://github.com/mattpocock/skills.git";
const upstreamDepth = 500;

const versionParts = (version) => version.split(/[.-]/);

const hasDrifted = (watch, verified, current) => {
  if (watch === "exact") return verified !== current;
  const [was, now] = [versionParts(verified), versionParts(current)];
  if (watch === "major") return was[0] !== now[0];
  return was[0] !== now[0] || was[1] !== now[1];
};

const fetchDistTag = async (name, tag) => {
  const response = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (!response.ok) throw new Error(`npm registry answered ${response.status}`);
  const metadata = await response.json();
  const version = metadata["dist-tags"]?.[tag];
  if (!version) throw new Error(`no "${tag}" dist-tag`);
  return version;
};

const dayAfter = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};

const readUpstreamCommits = (since) => {
  const dir = mkdtempSync(join(tmpdir(), "upstream-"));
  try {
    execFileSync("git", ["clone", "-q", "--filter=blob:none", "--no-checkout", `--depth=${upstreamDepth}`, upstreamUrl, dir], { stdio: "ignore" });
    const log = execFileSync("git", ["-C", dir, "log", `--since=${since}T00:00:00Z`, "--format=%h %ad %s", "--date=short"], { encoding: "utf8" });
    return log.split("\n").filter(Boolean);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const checkPackages = async () => {
  const moved = [];
  const errors = [];
  for (const entry of tracked.packages) {
    try {
      const current = await fetchDistTag(entry.name, entry.tag);
      if (hasDrifted(entry.watch, entry.verified, current)) moved.push({ ...entry, current });
    } catch (error) {
      errors.push(`\`${entry.name}@${entry.tag}\`: ${error.message}`);
    }
  }
  return { moved, errors };
};

// Shipped workflows (stacks/*/project-files) sit outside this repo's
// .github/workflows, so Dependabot never bumps their action pins.
const latestTag = (repo) => {
  const refs = execFileSync("git", ["ls-remote", "--tags", "--refs", `https://github.com/${repo}.git`], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  const versions = [...refs.matchAll(/refs\/tags\/v(\d+)\.(\d+)\.(\d+)$/gm)].map((m) => m.slice(1).map(Number));
  versions.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  return versions.at(-1)?.join(".");
};

const checkActionPins = () => {
  const moved = [];
  const errors = [];
  const files = execFileSync("git", ["ls-files", "stacks/*/project-files/.github/workflows/*.yml"], { cwd: fileURLToPath(root), encoding: "utf8" }).split("\n").filter(Boolean);
  for (const file of files) {
    for (const [, repo, pinned] of readFileSync(new URL(file, root), "utf8").matchAll(/uses: ([\w.-]+\/[\w.-]+)@[0-9a-f]{40} # v(\d+\.\d+\.\d+)/g)) {
      try {
        const latest = latestTag(repo);
        if (latest && latest !== pinned) moved.push({ file, repo, pinned, latest });
      } catch (error) {
        errors.push(`\`${repo}\` tags: ${error.stderr?.toString().trim() || error.message}`);
      }
    }
  }
  return { moved, errors };
};

const checkUpstream = () => {
  const harvested = maintenance.match(/last diffed (\d{4}-\d{2}-\d{2})/)?.[1];
  if (!harvested) return { harvested: null, commits: [], error: "no `last diffed YYYY-MM-DD` date found in MAINTENANCE.md" };
  try {
    return { harvested, commits: readUpstreamCommits(dayAfter(harvested)), error: null };
  } catch (error) {
    return { harvested, commits: [], error: `git clone of ${upstreamUrl} failed: ${error.message}` };
  }
};

const renderReport = ({ moved, errors }, actions, upstream) => {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    `## Playbook freshness — ${today}`,
    "",
    `Baseline: package versions verified on ${tracked.verifiedOn} (\`scripts/tracked-packages.json\`); upstream skills harvested ${upstream.harvested ?? "unknown"} (\`MAINTENANCE.md\`).`,
    "",
  ];
  if (moved.length) {
    lines.push("### Packages that moved", "", "| Package | Tag | Verified | Now | Watching | Affects |", "| --- | --- | --- | --- | --- | --- |");
    for (const p of moved) lines.push(`| \`${p.name}\` | ${p.tag} | ${p.verified} | **${p.current}** | ${p.watch} | ${p.affects} |`);
    lines.push("");
  }
  if (actions.moved.length) {
    lines.push("### Shipped action pins that moved", "", "| Action | Pinned | Latest | File |", "| --- | --- | --- | --- |");
    for (const a of actions.moved) lines.push(`| \`${a.repo}\` | v${a.pinned} | **v${a.latest}** | \`${a.file}\` |`);
    lines.push("", "Read the release notes, then update the SHA and the version comment together. Projects get these bumps from their own Dependabot.", "");
  }
  if (upstream.commits.length) {
    const shown = upstream.commits.slice(0, 40);
    const count = upstream.commits.length >= upstreamDepth ? `${upstreamDepth}+` : String(upstream.commits.length);
    lines.push(`### Upstream: mattpocock/skills — ${count} commits since ${upstream.harvested}`, "");
    for (const commit of shown) lines.push(`- ${commit}`);
    if (upstream.commits.length > shown.length) lines.push(`- … and ${upstream.commits.length - shown.length} more`);
    lines.push("", "Read its `CHANGELOG.md` and `.changeset/` since that date, and verify against the SKILL.md files (MAINTENANCE.md).", "");
  }
  const allErrors = [...errors, ...actions.errors, ...(upstream.error ? [upstream.error] : [])];
  if (allErrors.length) {
    lines.push("### Could not check", "");
    for (const error of allErrors) lines.push(`- ${error}`);
    lines.push("");
  }
  lines.push("---", "", "After re-verifying, bump the versions and `verifiedOn` in `scripts/tracked-packages.json` and the harvest date in `MAINTENANCE.md`, so the next report starts from the new baseline.");
  return lines.join("\n");
};

const packages = await checkPackages();
const actions = checkActionPins();
const upstream = checkUpstream();
const hasFindings = [packages.moved, packages.errors, actions.moved, actions.errors, upstream.commits].some((list) => list.length > 0) || upstream.error !== null;

writeFileSync(reportPath, `${renderReport(packages, actions, upstream)}\n`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `has_findings=${hasFindings}\n`);
console.log(hasFindings ? `Findings written to ${reportPath}` : "Playbook is current — no findings");
