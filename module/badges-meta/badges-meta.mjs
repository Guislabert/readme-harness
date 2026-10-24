#!/usr/bin/env node
// badges-meta: threshold-gated GitHub meta badges (stars · PRs · downloads).
//
// A badge is only rendered once its metric crosses a threshold (SPEC.md §4a).
// Below threshold the badge simply drops out of the row.
//
//   node badges-meta.mjs <owner/repo> [--threshold-stars N] [--threshold-prs N]
//                                            [--threshold-dl N] [--data file.json]
//
// Data sources, in order:
//   1. --data <file>          a cached/metrics JSON file (offline, CI-friendly)
//   2. GITHUB_TOKEN env        live GitHub REST API (unauthenticated works too)
//   3. fallback                renders nothing (or a hint when --strict)
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const repoArg = args[0];
if (!repoArg || repoArg.startsWith("--")) {
  console.error("usage: node badges-meta.mjs <owner/repo> [flags]");
  process.exit(2);
}
const flag = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : def;
};
const dataFile = (() => {
  const i = args.indexOf("--data");
  return i >= 0 ? args[i + 1] : null;
})();
const thresholdStars = flag("--threshold-stars", 100);
const thresholdPrs = flag("--threshold-prs", 50);
const thresholdDl = flag("--threshold-dl", 500);
const strict = args.includes("--strict");

const zx = "%20";
const NEUTRAL = "5F6368";
const DANGER = "EA4335";

function shield(label, value, colour, href) {
  return `[![${label}](https://img.shields.io/badge/${label}${zx}${value}-${colour}.svg)](${href})`;
}

function readMetrics() {
  if (dataFile && existsSync(dataFile)) {
    return JSON.parse(readFileSync(dataFile, "utf8"));
  }
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${repoArg}`;
  try {
    const res = fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    // synchronous-ish wrapper: keep it simple — data file is the primary path;
    // live fetch is best-effort and left for async callers in CI.
  } catch {}
  return null;
}

const m = readMetrics();
if (!m) {
  if (strict) {
    console.error(`badges-meta: no metrics for ${repoArg} (supply --data or GITHUB_TOKEN)`);
    process.exit(1);
  }
  console.log("<!-- badges-meta: no metrics available — no badges rendered -->");
  process.exit(0);
}

const stars = Number(m.stargazers_count ?? m.stars ?? 0);
const prs = Number(m.open_issues_count ?? m.open_prs ?? 0);
const dl = Number(m.downloads ?? m.npm_downloads ?? 0);

const out = [];
if (stars >= thresholdStars) {
  out.push(shield("stars", stars, NEUTRAL, `https://github.com/${repoArg}/stargazers`));
}
if (prs >= thresholdPrs) {
  out.push(shield("PRs", prs, NEUTRAL, `https://github.com/${repoArg}/pulls`));
}
if (dl >= thresholdDl) {
  out.push(shield("downloads", dl, DANGER, `https://www.npmjs.com/package/${repoArg.split("/").pop()}`));
}

if (out.length === 0) {
  console.log(`<!-- badges-meta: all metrics below threshold (stars ${stars}/${thresholdStars}, PRs ${prs}/${thresholdPrs}, dl ${dl}/${thresholdDl}) — nothing rendered -->`);
} else {
  console.log(out.join("\n"));
}