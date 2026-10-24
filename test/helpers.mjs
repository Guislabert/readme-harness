// Shared test helpers: run a Readme Harness CLI in a scratch dir and assert.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, "..");

/** Make a fresh scratch dir (caller should clean() it). */
export function scratch() {
  return mkdtempSync(join(tmpdir(), "rh-test-"));
}
export function clean(d) {
  rmSync(d, { recursive: true, force: true });
}

/** Run a Node script (path relative to repo root) with args in cwd, capture stdout/stderr/status. */
export function runCLI(relPath, args, { cwd = process.cwd(), env = {} } = {}) {
  const r = spawnSync("node", [join(ROOT, relPath), ...(args ?? [])], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { stdout: r.stdout ?? "", stderr: r.stderr ?? "", status: r.status ?? -1 };
}

/** Write a minimal package.json into a dir. */
export function writePkg(dir, overrides = {}) {
  const pkg = { name: "probe", version: "0.1.0", private: true, ...overrides };
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
}

/** Make a dir tree under base (mkdir recursive). */
export function mkdir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

export { existsSync, join };