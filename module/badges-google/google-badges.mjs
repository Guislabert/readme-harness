#!/usr/bin/env node
// Google four-color badge standard: audit or --fix a project's README badge row.
// Palette: CI #34A853, Version #4285F4, npm version #EA4335, License #FBBC05.
// Usage: node google-badges.mjs <project-dir> [--fix] [--force]
//
// Safety: a --fix write is rejected when the file would shrink by more than
// 20% (the d084000-class failure: a greedy replacement eating the document
// body). --force overrides after a human checks the diff.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const fix = process.argv.includes("--fix");
const force = process.argv.includes("--force");
if (!dir || !existsSync(join(dir, "README.md"))) {
  console.error(`usage: node google-badges.mjs <project-with-README.md> [--fix] [--force]`);
  process.exit(2);
}
const version = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version ?? null;
let authors = {};
try { authors = JSON.parse(readFileSync(join(dir, ".badge-standard.json"), "utf8")); }
catch { /* defaults below */ }
const licenseLabel = authors.licenseLabel ?? "License: MIT";
const npmPkg = authors.npmPackage ?? null;
const ciRepo = authors.ciRepo ?? null; // owner/name for the Actions link
const localeLabel = authors.versionLabel ?? { en: "Version", zh: "\u7248\u672c", ja: "\u30d0\u30fc\u30b8\u30e7\u30f3" };

const C = "34A853", B = "4285F4", R = "EA4335", Y = "FBBC05";
const zx = "%20";
const MAX_BODY_LOSS = 0.20; // a --fix may shrink a README by at most 20%

function row(lang) {
  const lv = localeLabel[lang] ?? "Version";
  const label = `${lv}-0.0.1-`.replace("0.0.1", version ?? "0.0.0");
  const npm = npmPkg ? `[![npm version](https://img.shields.io/badge/npm${zx}version-${version}-${R}.svg)](https://www.npmjs.com/package/${npmPkg})\n` : "";
  const ci = ciRepo ? `[![CI](https://img.shields.io/badge/CI-passing-${C}.svg)](https://github.com/${ciRepo}/actions)\n` : "";
  const lic = existsSync(join(dir, "LICENSE")) ? `[![${licenseLabel}](https://img.shields.io/badge/{LICENSE}-${Y}.svg)](https://opensource.org/licenses/MIT)\n`.replace("{LICENSE}", licenseLabel.replace(": ", "-")) : "";
  return ci + `[![${lv}](https://img.shields.io/badge/${label}-${B}.svg)](CHANGELOG.md)\n` + npm + lic;
}

let anyBlocked = false;
for (const f of ["README.md", "README.zh-CN.md", "README.ja.md"]) {
  const p = join(dir, f);
  if (!existsSync(p)) { if (f === "README.md") console.error(`note: ${p} missing`); continue; }
  const s = readFileSync(p, "utf8");
  const lang = f.includes("zh") ? "zh" : f.includes("ja") ? "ja" : "en";
  // a badge line is an image whose target contains img.shields.io
  const lines = s.split("\n");
  const isBadge = (l) => l.trim().replace(/^\[\s*!?\]|^!\[/, "").trim().startsWith("[") || false;
  const start = lines.findIndex((l) => l.trim().startsWith("[![") && l.includes("img.shields.io"));
  if (start < 0) { console.log(`${f}: no shields badge row — insert manually at the block top`); continue; }
  let end = start;
  while (end < lines.length && lines[end].includes("img.shields.io")) end++;
  const cur = lines.slice(start, end).join("\n");
  const want = row(lang).trim();
  if (cur === want) { console.log(`${f}: already conforms ✓`); continue; }
  if (!fix) { console.log(`${f}: drift (apply --fix)\n  now:  ${cur.slice(0, 120)}\n  want: ${want.slice(0, 120)}`); continue; }

  const cand = lines.slice(0, start).concat(want.split("\n"), lines.slice(end)).join("\n");
  const before = Buffer.byteLength(s), after = Buffer.byteLength(cand);
  const loss = before - after;
  if (loss > before * MAX_BODY_LOSS && !force) {
    anyBlocked = true;
    console.error(`${f}: BLOCKED — a --fix write would shrink the file by ${(loss / before * 100).toFixed(0)}% (${before}B → ${after}B).`);
    console.error(`  A body-eating replacement is suspected (the d084000 failure class).`);
    console.error(`  Inspect the diff by hand, then rerun with --force if it really is intended.`);
    continue;
  }

  writeFileSync(p, cand);
  console.log(`${f}: rewritten (${before}B → ${after}B${loss ? `, ${loss >= 0 ? "-" : "+"}${Math.abs(loss)}B` : ""})`);
}
process.exit(anyBlocked ? 1 : 0);
