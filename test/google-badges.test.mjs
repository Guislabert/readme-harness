import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scratch, clean, runCLI, writePkg } from "./helpers.mjs";

const CLI = "module/badges-google/google-badges.mjs";

test("google-badges: usage error when README missing", () => {
  const d = scratch();
  try {
    const r = runCLI(CLI, [d]);
    assert.equal(r.status, 2);
    assert.match(r.stdout + r.stderr, /usage:/);
  } finally {
    clean(d);
  }
});

test("google-badges: reports no shields row when README lacks badges", () => {
  const d = scratch();
  try {
    writePkg(d);
    writeFileSync(join(d, "README.md"), "# X\nplain text no badges\n");
    const r = runCLI(CLI, [d]);
    assert.equal(r.status, 0);
    assert.match(r.stdout + r.stderr, /no shields badge row/);
  } finally {
    clean(d);
  }
});

test("google-badges: detects drift when badge version differs from package.json", () => {
  const d = scratch();
  try {
    writePkg(d, { version: "1.5.0" });
    writeFileSync(
      join(d, "README.md"),
      `# X\n\n` +
        `[![Version](https://img.shields.io/badge/Version-0.9.0-4285F4.svg)][vlg]` +
        `\n\n[vlg]: CHANGELOG.md\n`
    );
    const r = runCLI(CLI, [d]);
    assert.equal(r.status, 0);
    assert.match(r.stdout + r.stderr, /drift/);
  } finally {
    clean(d);
  }
});

test("google-badges: --fix rewrites the badge to the detected version", () => {
  const d = scratch();
  try {
    writePkg(d, { version: "3.2.1" });
    writeFileSync(
      join(d, "README.md"),
      `# X\n\n` +
        `[![Version](https://img.shields.io/badge/Version-0.0.1-4285F4.svg)][vlg]` +
        `\n\n[vlg]: CHANGELOG.md\n`
    );
    const r = runCLI(CLI, [d, "--fix"]);
    assert.equal(r.status, 0);
    const readme = readFileSync(join(d, "README.md"), "utf8");
    assert.match(readme, /Version-3\.2\.1-/, "badge rewritten to 3.2.1");
  } finally {
    clean(d);
  }
});