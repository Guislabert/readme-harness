import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { scratch, clean, runCLI, writePkg, mkdir } from "./helpers.mjs";

test("generate: no args prints usage and exits non-zero", () => {
  const r = runCLI("tools/generate.mjs", []);
  assert.equal(r.status, 2, "exit code is usage error");
  assert.match(r.stdout + r.stderr, /usage:/);
});

test("generate: refuses to overwrite an existing README", () => {
  const d = scratch();
  try {
    writePkg(d);
    writeFileSync(join(d, "README.md"), "# existing\n");
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 2, "refuses to overwrite");
    assert.match(r.stdout + r.stderr, /refusing to overwrite/);
    assert.equal(readFileSync(join(d, "README.md"), "utf8"), "# existing\n", "README untouched");
  } finally {
    clean(d);
  }
});

test("generate: emits README + AGENTS.md (+ NOTICES when deps exist)", () => {
  const d = scratch();
  try {
    writePkg(d, { dependencies: { lodash: "^4" } });
    mkdir(join(d, "module", "badges-google"));
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 0);
    // README
    const readme = readFileSync(join(d, "README.md"), "utf8");
    assert.match(readme, /^# \S+/m, "h1 is the project (dir) name");
    assert.match(readme, /Version-0\.1\.0-/, "version baked into badge");
    // AGENTS.md
    const agents = readFileSync(join(d, "AGENTS.md"), "utf8");
    assert.match(agents, /AI working contract/);
    // NOTICES because deps
    const notices = readFileSync(join(d, "THIRD_PARTY_NOTICES.md"), "utf8");
    assert.match(notices, /lodash/);
    assert.match(notices, /licence/);
  } finally {
    clean(d);
  }
});

test("generate: no NOTICES file when the repo has no third-party deps", () => {
  const d = scratch();
  try {
    writePkg(d);
    runCLI("tools/generate.mjs", [d]);
    assert.throws(() => readFileSync(join(d, "THIRD_PARTY_NOTICES.md")));
  } finally {
    clean(d);
  }
});

test("generate: warns when CHANGELOG version disagrees with package.json", () => {
  const d = scratch();
  try {
    writePkg(d, { version: "2.0.0" });
    writeFileSync(join(d, "CHANGELOG.md"), "# Changelog\n\n## [1.0.0] — 2026-01-01\n");
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 0, "still generates");
    assert.match(r.stdout + r.stderr, /CHANGELOG newest is \[1\.0\.0\] but package.json is 2\.0\.0/);
  } finally {
    clean(d);
  }
});

test("generate: warns when no CHANGELOG exists", () => {
  const d = scratch();
  try {
    writePkg(d);
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 0);
    assert.match(r.stdout + r.stderr, /no CHANGELOG/);
  } finally {
    clean(d);
  }
});

test("generate: no warning when CHANGELOG matches package.json", () => {
  const d = scratch();
  try {
    writePkg(d, { version: "1.1.1" });
    writeFileSync(join(d, "CHANGELOG.md"), "# Changelog\n\n## [1.1.1] — 2026-01-01\n");
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 0);
    assert.doesNotMatch(r.stdout + r.stderr, /warning/);
  } finally {
    clean(d);
  }
});

test("generate: falls back to your-username when no git remote", () => {
  const d = scratch();
  try {
    writePkg(d);
    const r = runCLI("tools/generate.mjs", [d]);
    assert.equal(r.status, 0);
    assert.match(readFileSync(join(d, "README.md"), "utf8"), /MIT © your-username/);
  } finally {
    clean(d);
  }
});