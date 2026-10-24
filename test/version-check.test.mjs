import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { scratch, clean, runCLI, writePkg } from "./helpers.mjs";

const CLI = "tools/version-check.mjs";

// version-check reads relative paths in its cwd. So we run it with cwd=scratch dir.
function runIn(dir, argv = []) {
  return runCLI(CLI, argv, { cwd: dir });
}

function makeRepo(d, { pkgVersion = "1.2.3", changelogVersion = "1.2.3", readmeVersion } = {}) {
  writePkg(d, { version: pkgVersion });
  writeFileSync(
    join(d, "CHANGELOG.md"),
    `# Changelog\n\n## [${changelogVersion}] — 2026-01-01\n`
  );
  const rv = readmeVersion ?? pkgVersion;
  writeFileSync(
    join(d, "README.md"),
    `# X\n\n[![Version](https://img.shields.io/badge/Version-${rv}-4285F4.svg)][vlg]\n\n[vlg]: CHANGELOG.md\n`
  );
}

test("version-check: passes when all surfaces agree", () => {
  const d = scratch();
  try {
    makeRepo(d);
    const r = runIn(d);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /1\.2\.3: package.json = CHANGELOG = README badges/);
  } finally {
    clean(d);
  }
});

test("version-check: fails when package.json differs from CHANGELOG", () => {
  const d = scratch();
  try {
    makeRepo(d, { pkgVersion: "2.0.0", changelogVersion: "1.0.0" });
    const r = runIn(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /CHANGELOG newest section is \[1\.0\.0\], package.json is 2\.0\.0/);
  } finally {
    clean(d);
  }
});

test("version-check: fails when README badge differs from package.json", () => {
  const d = scratch();
  try {
    makeRepo(d, { pkgVersion: "1.2.3", readmeVersion: "9.9.9" });
    const r = runIn(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /README\.md: Version badge is 9\.9\.9, package.json is 1\.2\.3/);
  } finally {
    clean(d);
  }
});

test("version-check: fails when package.json version is not x.y.z", () => {
  const d = scratch();
  try {
    makeRepo(d, { pkgVersion: "1.2" });
    const r = runIn(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /is not x\.y\.z/);
  } finally {
    clean(d);
  }
});

test("version-check: fails when CHANGELOG missing a version header", () => {
  const d = scratch();
  try {
    writePkg(d, { version: "1.2.3" });
    writeFileSync(join(d, "CHANGELOG.md"), "# Changelog\nno header here\n");
    const r = runIn(d);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /CHANGELOG.md has no `## \[x\.y\.z\]` section/);
  } finally {
    clean(d);
  }
});

test("version-check: exits 1 when package.json is missing", () => {
  const d = scratch();
  try {
    const r = runIn(d);
    assert.equal(r.status, 1);
  } finally {
    clean(d);
  }
});