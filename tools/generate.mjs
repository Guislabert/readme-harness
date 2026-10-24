#!/usr/bin/env node
// Readme Harness — one-command README scaffold generator with AUTO-DETECTION.
//
// Usage:   node tools/generate.mjs <new-repo-dir>            # auto-detect
// Example: node tools/generate.mjs /path/my-new-repo
//
// What it does (no human prompts required):
//   1. Inspects the target repo and DETECTS its shape on its own:
//        - project name      <- dir name
//        - package kind      <- package.json / pyproject.toml / go.mod / Cargo.toml
//        - version           <- same manifests
//        - CI present        <- .github/workflows / .gitlab-ci.yml / Jenkinsfile
//   2. Picks matching modules already present in the repo (scanned, not guessed).
//   3. Renders a README skeleton with those choices baked in.
//   4. Never overwrites an existing README.md (safety).
//
// Inspired by DeepSeek-Harness ("Everything is a Plugin") and maintained by
// @Guislabert — Git-first, npm-never.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const target = process.argv[2];
if (!target) {
  console.error("usage: node tools/generate.mjs <new-repo-dir>");
  process.exit(2);
}
const dest = resolve(target);
if (existsSync(join(dest, "README.md"))) {
  console.error(`refusing to overwrite ${join(dest, "README.md")}`);
  process.exit(2);
}

const read = (p) => {
  try { return readFileSync(join(dest, ...p), "utf8"); }
  catch { return ""; }
};
const has = (p) => existsSync(join(dest, ...p));

// ---- 0. git remote -> owner/repo (auto-detection) ------------------------
// Derive the GitHub owner + repo from the target's `origin` remote so every
// generated README links to real pages instead of placeholders. Falls back to
// env override, then to a naive "your-username" marker.
const { execFileSync } = await import("node:child_process");
const name = basename(dest);
function readOwnerRepo() {
  try {
    const raw = execFileSync("git", ["-C", dest, "remote", "get-url", "origin"], {
      encoding: "utf8",
    }).trim();
    // accept https://github.com/O/R.git, git@github.com:O/R.git, ssh://git@github.com/O/R.git
    const m = raw.match(/(?:github\.com)[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (m) return { owner: m[1], repo: m[2] };
  } catch { /* no remote yet — fall through */ }
  if (process.env.README_HARNESS_OWNER) {
    return { owner: process.env.README_HARNESS_OWNER, repo: name };
  }
  return { owner: "your-username", repo: name };
}
const { owner, repo } = readOwnerRepo();
const page =
  owner === "your-username" ? "#" : `https://github.com/${owner}/${repo}`;

// ---- 1. auto-detect ------------------------------------------------------

const pkg = (() => { try { return JSON.parse(read(["package.json"])); } catch { return {}; } })();
const cargo = read(["Cargo.toml"]);
const pyproj = read(["pyproject.toml"]);
const gomod = read(["go.mod"]);

const version =
  pkg.version ??
  (cargo.match(/^version\s*=\s*"([^"]+)"/m) || [])[1] ??
  (pyproj.match(/^version\s*=\s*['"]([^'"]+)['"]/m) || [])[1] ??
  "0.0.0";

const kind =
  pkg.name ? "Node (package.json)"
  : cargo.includes("[package]") ? "Rust (Cargo)"
  : gomod.startsWith("module ") ? "Go"
  : pyproj ? "Python (pyproject)"
  : "unknown";

const lang =
  has(["package.json"]) ? "Node"
  : has(["go.mod"]) ? "Go"
  : has(["Cargo.toml"]) ? "Rust"
  : has(["pyproject.toml"]) ? "Python"
  : "—";

const ci =
  has([".github", "workflows"]) ? "GitHub Actions"
  : has([".gitlab-ci.yml"]) ? "GitLab CI"
  : has(["Jenkinsfile"]) ? "Jenkins"
  : null;
const ciUrl =
  ci === "GitHub Actions" && owner !== "your-username"
    ? `${page}/actions`
    : "#";

// ---- 1b. third-party deps scan (for THIRD_PARTY_NOTICES.md) -----------------
// Readme Harness has zero runtime deps itself. But every repo it scaffolds may
// pull in third-party packages whose licences must be disclosed (MIT/BSP/GPL
// redistribution duties). We auto-detect and emit a NOTICES file so the
// scaffolded repo starts licence-compliant instead of discovering it later.
const depNames = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...(typeof pkg.optionalDependencies === "object" ? Object.keys(pkg.optionalDependencies) : []),
];

// modules already landed in the repo (scanned, not guessed by language)
const modules = [];
if (has(["module", "badges-google"])) modules.push("badges-google");

// ---- 2. render -----------------------------------------------------------
let badges;
if (modules.includes("badges-google")) {
  badges =
    `[![CI](https://img.shields.io/badge/CI-passing-34A853.svg)][ci]\n` +
    `[![Version](https://img.shields.io/badge/Version-${version}-4285F4.svg)][vlg]\n` +
    `[![License: MIT](https://img.shields.io/badge/License%3A%20MIT-FBBC05.svg)][osi]`;
} else {
  badges = "<!-- add a badges module: cp -r module/badges-google . && regenerate -->";
}

const ciNote = ci ? `, CI built by \`${ci}\`` : ", no CI detected";
const out =
`# ${name}

> <One-line tagline in English (en-GB). Auto-detected: ${kind}, version ${version}${ciNote}.>
> Generated by [Readme Harness](https://github.com/Guislabert/readme-harness).

<div align="center">

${badges}

</div>

## Why
<!-- State the problem / status quo in 2-4 lines. -->

## What
<!-- One paragraph: what the project ships. -->

## Quick start
<!-- 3 concrete, runnable steps from zero to working. -->

## Adopting / Contributing
<!-- Policy, decision rules. -->

## License
MIT © ${owner}

[ci]: ${ciUrl}
[vlg]: CHANGELOG.md
[osi]: https://opensource.org/licenses/MIT
`;

mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "README.md"), out);
console.log(`[readme-harness] generated ${join(dest, "README.md")}`);

// ---- 3. AGENTS.md — the DeepSeek-Harness-style AI guide ---------------------
// A target repo's AGENTS.md is the file an AI coding-agent (Claude Code, etc.)
// reads automatically when it starts working there. Emitting one alongside the
// README is what makes Readme Harness actually "AI + Harness": the agent learns
// the project's shape and discipline without being reminded.
const agentsOut =
`# AGENTS.md — AI working contract

> Auto-generated by [Readme Harness](https://github.com/Guislabert/readme-harness) for \`${name}\`.
> An AI coding agent reads this file when it starts work in this repository.

## Project

- **Name**: \`${name}\`
- **Kind**: ${kind}
- **Version**: \`${version}\`
- **CI**: \`${ci ?? "none"}\`

## README discipline (enforced, not optional)

- Keep \`README.md\` in **English (en-GB)**; other languages live in separate
  \`README.<lang>.md\` files (e.g. \`README.zh-CN.md\`), never inline.
- Keep every README **Version badge** in sync:
  \`package.json.version\` === \`CHANGELOG newest section\` === \`README badges\`
  (run \`node tools/version-check.mjs\`).
- Version bumps are release points (SemVer): fix → PATCH, backward-compatible
  feature → MINOR, breaking change → MAJOR. Pre-\`1.0\` (\`0.y.z\`) is unstable.

## Modules

Modules this repo ships, as detected:

${modules.length ? "- " + modules.join("\n- ") : "- (none yet — pick from the Readme Harness registry)"}

When adding a section, feature, or claim to \`README.md\`, prefer an existing
module over ad-hoc edits; keep the badge row and structure consistent with the
framework (SPEC.md §4a).
`;
writeFileSync(join(dest, "AGENTS.md"), agentsOut);
console.log(`[readme-harness] also generated ${join(dest, "AGENTS.md")}`);

// ---- 4. THIRD_PARTY_NOTICES.md -------------------------------------------
// Emit a notices file whenever the scaffolded repo declares third-party
// dependencies (licence-redistribution duty), mirroring DeepSeek-Harness's
// THIRD_PARTY_NOTICES.md disclosure. No deps → no file (nothing to disclose).
if (depNames.length) {
  const noticesOut =
`# Third-Party Notices

> Auto-generated by [Readme Harness](https://github.com/Guislabert/readme-harness) for \`${name}\`\n> to disclose the licences of third-party packages this project uses.\n\nThe following dependencies are bundled or relied upon by this project. Their\nlicences carry redistribution duties; the exact licence text belongs to each\nrespective author. If you redistribute this project, retain every notice.\n\n## Dependency list\n\n${depNames.map((d) => `- \`${d}\` — licence: see the package's own \`LICENSE\` / \`package.json\``).join("\n")}\n\n## Duties\n\n- Keep this file in sync with the actual dependency set (run the generator again\n  after adding a dependency).\n- Do not strip these notices if you re-publish the project.\n`;
  writeFileSync(join(dest, "THIRD_PARTY_NOTICES.md"), noticesOut);
  console.log(`[readme-harness] also generated ${join(dest, "THIRD_PARTY_NOTICES.md")} (${depNames.length} dep(s))`);
} else {
  console.log(`[readme-harness] no third-party deps detected — no THIRD_PARTY_NOTICES.md`);
}
console.log(`  detected: name=${name} kind=${kind} version=${version} lang=${lang} ci=${ci ?? "none"} modules=[${modules.join(", ") || "none"}]`);
console.log(`  origin -> ${owner === "your-username" ? "(none set; set README_HARNESS_OWNER or git remote origin)" : `${owner}/${repo}`}`);