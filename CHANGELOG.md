# Changelog

All notable changes to Readme Harness are documented here. Follows
[Keep a Changelog](https://keepachangelog.com) and SemVer; `package.json.version`,
the newest `## [x.y.z]` section, and every README Version badge must always
match (enforced by `tools/version-check.mjs` in CI).

## [0.1.0] — 2026-10-24

Initial release. First capability-tier version: a usable, pre-stability
framework rather than an empty scaffold.

### Added
- `badges-meta` module — threshold-gated GitHub-meta badges (stars · PRs ·
  downloads); only renders once a metric crosses its threshold (`SPEC.md §4a`).
- `scripts/ci-badges-meta.sh` + `.github/workflows/ci.yml` — CI runs the
  version-train guard, badge-row audit, `badges-meta` sanity, and a
  generator walk-through on every push/PR.
- Framework scaffold: `module/`, `skeleton/`, `tools/`, `REGISTRY.md`, `SPEC.md`.
- `badges-google` module — Google four-colour badge row (CI · Version · License),
  landable via `module/badges-google/`, extendable from the semantic palette.
- Semantic colour palette for extending beyond four badges (`SPEC.md §4`).
- `tools/generate.mjs` — one-command README generator with auto-detection
  (language/dependency manifest, version, CI, modules, `git remote` owner/repo).
- `tools/version-check.mjs` — release-train consistency guard.
- English (en-GB) main page and Simplified-Chinese separate page.

### Changed
- `google-badges.mjs` — fixed non-ASCII label rendering (double-dash labels).

### Added (i18n)
- Simplified-Chinese versions of every English doc: `SPEC.zh-CN.md`,
  `REGISTRY.zh-CN.md`, `CHANGELOG.zh-CN.md`, and `README.zh-CN.md` module cards
  in `module/badges-google/` and `module/badges-meta/`.
- `assets/hero-{light,dark}.svg` — theme-aware hero image (ClawBench-style
  serif header + gradient background + capsule labels), shown at the top of both
  README pages via `<picture>`.

### Added (AI + Harness)
- `tools/generate.mjs` now also emits an **`AGENTS.md`** (an AI working
  contract) alongside the README — a DeepSeek-Harness-style guide so a coding
  agent opening the repo learns its README discipline, SemVer bump rules, and
  module list without being reminded.
- `tools/generate.mjs` auto-detects the scaffolded repo's third-party
  dependencies and emits a **`THIRD_PARTY_NOTICES.md`** disclosure (mirroring
  DeepSeek-Harness), so a new repo starts licence-distribution compliant.

### Fixed
- `badges-meta.mjs` — removed a dead live-GitHub-API branch (a synchronous
  `fetch` can never return before the script exits, so it silently became a
  no-op). Metrics must come via `--data`. Badge labels are now URL-encoded.
- `tools/generate.mjs` — THIRD_PARTY_NOTICES template uses real new-lines like
  the rest of the file; generates a **version-consistency hint** so a scaffolded
  repo's CHANGELOG / package.json / README badge stay in sync from day one.
- `tools/version-check.mjs` — removed a dead no-op comment block.

### Docs
- README / SPEC (en + zh-CN) now document that `generate` also emits
  `AGENTS.md` and (with third-party deps) `THIRD_PARTY_NOTICES.md`.
- Added `.gitignore`.

### Tests
- Added a zero-dependency unit-test suite (`node:test`) covering all four
  CLIs: `tools/generate.mjs` (8), `tools/version-check.mjs` (6),
  `module/badges-meta/badges-meta.mjs` (9), `module/badges-google/google-badges.mjs`
  (4) — 27 tests total. Wired as `npm test` and added to CI.
- `generate`'s `AGENTS.md` now includes a **Testing** section (borrowed from
  the LayerFS agent contract): new logic ships with a test, prefer the smallest
  test, and run `npm test` locally rather than trusting CI alone.