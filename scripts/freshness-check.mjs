import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

const checkUpstream = () => {
  const harvested = maintenance.match(/last diffed (\d{4}-\d{2}-\d{2})/)?.[1];
  if (!harvested) return { harvested: null, commits: [], error: "no `last diffed YYYY-MM-DD` date found in MAINTENANCE.md" };
  try {
    return { harvested, commits: readUpstreamCommits(dayAfter(harvested)), error: null };
  } catch (error) {
    return { harvested, commits: [], error: `git clone of ${upstreamUrl} failed: ${error.message}` };
  }
};

const renderReport = ({ moved, errors }, upstream) => {
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
  if (upstream.commits.length) {
    const shown = upstream.commits.slice(0, 40);
    const count = upstream.commits.length >= upstreamDepth ? `${upstreamDepth}+` : String(upstream.commits.length);
    lines.push(`### Upstream: mattpocock/skills — ${count} commits since ${upstream.harvested}`, "");
    for (const commit of shown) lines.push(`- ${commit}`);
    if (upstream.commits.length > shown.length) lines.push(`- … and ${upstream.commits.length - shown.length} more`);
    lines.push("", "Read its `CHANGELOG.md` and `.changeset/` since that date, and verify against the SKILL.md files (MAINTENANCE.md).", "");
  }
  const allErrors = [...errors, ...(upstream.error ? [upstream.error] : [])];
  if (allErrors.length) {
    lines.push("### Could not check", "");
    for (const error of allErrors) lines.push(`- ${error}`);
    lines.push("");
  }
  lines.push("---", "", "After re-verifying, bump the versions and `verifiedOn` in `scripts/tracked-packages.json` and the harvest date in `MAINTENANCE.md`, so the next report starts from the new baseline.");
  return lines.join("\n");
};

const packages = await checkPackages();
const upstream = checkUpstream();
const hasFindings = packages.moved.length > 0 || packages.errors.length > 0 || upstream.commits.length > 0 || upstream.error !== null;

writeFileSync(reportPath, `${renderReport(packages, upstream)}\n`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `has_findings=${hasFindings}\n`);
console.log(hasFindings ? `Findings written to ${reportPath}` : "Playbook is current — no findings");
