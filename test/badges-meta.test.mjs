import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { scratch, clean, runCLI } from "./helpers.mjs";

const CLI = "module/badges-meta/badges-meta.mjs";

function data(d, obj) {
  const p = join(d, "metrics.json");
  writeFileSync(p, JSON.stringify(obj));
  return p;
}

test("badges-meta: usage error without owner/repo arg", () => {
  const r = runCLI(CLI, []);
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /usage:/);
});

test("badges-meta: no --data, non-strict → graceful no render, exit 0", () => {
  const r = runCLI(CLI, ["owner/repo"]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /no metrics available/);
});

test("badges-meta: no --data, strict → exit 1", () => {
  const r = runCLI(CLI, ["owner/repo", "--strict"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no metrics/);
});

test("badges-meta: all metrics below thresholds → nothing rendered", () => {
  const d = scratch();
  try {
    const p = data(d, { stargazers_count: 3, open_issues_count: 1, downloads: 10 });
    const r = runCLI(CLI, ["owner/repo", "--data", p]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /nothing rendered/);
    assert.doesNotMatch(r.stdout, /img\.shields\.io/);
  } finally {
    clean(d);
  }
});

test("badges-meta: stars above threshold → renders stars only (PRs below)", () => {
  const d = scratch();
  try {
    const p = data(d, { stargazers_count: 150, open_issues_count: 4 });
    const r = runCLI(CLI, ["owner/repo", "--data", p]);
    assert.match(r.stdout, /stars/);
    assert.doesNotMatch(r.stdout, /PRs/);
  } finally {
    clean(d);
  }
});

test("badges-meta: threshold flags override defaults", () => {
  const d = scratch();
  try {
    const p = data(d, { stargazers_count: 50, open_issues_count: 1 });
    // default stars threshold 100 → 50 hides; with --threshold-stars 10 → shows
    const r = runCLI(CLI, ["owner/repo", "--data", p, "--threshold-stars", "10"]);
    assert.match(r.stdout, /stars/);
  } finally {
    clean(d);
  }
});

test("badges-meta: downloads renders only when published (dl threshold)", () => {
  const d = scratch();
  try {
    const p = data(d, { stargazers_count: 0, downloads: 900 });
    const r = runCLI(CLI, ["owner/repo", "--data", p]);
    assert.match(r.stdout, /downloads/);
  } finally {
    clean(d);
  }
});

test("badges-meta: shield URL-encodes a label with spaces", () => {
  const d = scratch();
  try {
    // stargazers_count over threshold with label via high value; check URL well-formed
    const p = data(d, { stargazers_count: 200, open_issues_count: 60 });
    const r = runCLI(CLI, ["owner/repo", "--data", p]);
    // URL must be percent-encoded (space = %20), never a raw space inside path
    assert.doesNotMatch(r.stdout, /badge\/[^?]* [^?]*/); // no raw space inside url component after badge/
  } finally {
    clean(d);
  }
});

test("badges-meta: malformed --data JSON → treated as no metrics", () => {
  const d = scratch();
  try {
    const p = join(d, "metrics.json");
    writeFileSync(p, "{ not valid json !!");
    const r = runCLI(CLI, ["owner/repo", "--data", p]);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /no metrics available/);
  } finally {
    clean(d);
  }
});