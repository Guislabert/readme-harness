# Readme Harness — Framework Spec

> Standardised, modular authoring of project README / Landing pages.
> Written in English (en-GB). Chinese page: `README.zh-CN.md`.

## 1. Purpose

Readme Harness is the **base layer** on top of which every new repository's
landing page is assembled. It separates three concerns:

- the **skeleton** — page *structure* (section order, place-holders);
- **modules** — page *components* (badge rows, pills, hero…), each
  independently landable;
- the **registry** — the *catalogue* of what ships and where it goes.

## 2. Layout

```
readme-harness/
├── README.md          main page, written in English (en-GB)
├── README.zh-CN.md    separate Simplified-Chinese page
├── SPEC.md            this file
├── REGISTRY.md        module registry (single source of truth)
├── module/            one landable directory per module
├── skeleton/          copy-able commented skeleton
├── tools/             framework tooling (generator, guards)
└── LICENSE
```

## 3. Modules

- A **module** is a self-contained component that lands in a project as a
  directory (see `REGISTRY.md`).
- Every module must ship its own `README.md` — a **module card** stating its
  purpose, the target section of the page, and how to extend it.
- Modules are **optional**; a project may include none, one, or many.
- Module names are versioned and registry-listed; a module is never silently
  renamed.

## 4. Colour semantics

Colours are semantic, not decorative. `badges-google` encodes the Google
four-colour preset:

| Slot      | Colour | Hex       | Semantics                       |
|-----------|--------|-----------|---------------------------------|
| CI        | Green  | `#34A853` | build/CI state                  |
| Version   | Blue   | `#4285F4` | project core identity (release) |
| npm ver   | Red    | `#EA4335` | published artifact              |
| License   | Yellow | `#FBBC05` | warm closing (static)           |

Order follows the read: **built → versioned → published → licensed**.
When more than four badges are needed, extend from the **semantic palette**
(below) rather than re-using these four ad hoc.

| Semantic | Hex     | Use                                 |
|----------|---------|-------------------------------------|
| success  | `#34A853` | build/tests passing, coverage      |
| info     | `#4285F4` | version/identity, links            |
| danger   | `#EA4335` | published artifact, release        |
| warning  | `#FBBC05` | static/licence, warm closing       |
| neutral  | `#5F6368` | meta (stars, downloads, PRs)       |

## 4a. Badge display discipline (why not every badge, every time)

A badge is only shown when it is **true and useful**. Two common cases:

- **npm / published-artifact badge** — shown only when an artifact is actually
  published to a registry (`npmPackage` configured → points to the real page).
  This framework is **Git-first, npm-never**, so by default no npm badge renders.
  A fake `0 downloads`/non-existent-package badge harms credibility; add it only
  when a package really exists.
- **Stars / GitHub-meta badge** — shown only once the repo crosses a **threshold**
  (default `100`). A fresh repo at `0 stars` looks hollow, so `badges-meta`
  defers rendering until the count is meaningful. Threshold is configurable per
  project.

Read order stays `built → versioned → published → licensed → meta`; a hidden
badge simply drops out of the row (SSR, not a blank placeholder).

## 5. Version discipline

Reference: **[SemVer 2.0.0](https://semver.org/)** — the authoritative
specification this project follows. `tool:version-check.mjs`:
`package.json.version === CHANGELOG newest === README badges`.

### 5a. What a version bump means (SemVer 2.0.0)

SemVer defines three fields, `MAJOR.MINOR.PATCH`:

- **MAJOR** — incremented when you make **incompatible** API changes
  (`1.0.0 → 2.0.0` on a breaking change).
- **MINOR** — incremented when you add functionality in a **backward-
  compatible** manner (`1.0.0 → 1.1.0` on a new feature).
- **PATCH** — incremented when you make **backward-compatible bug fixes**
  (`1.0.0 → 1.0.1` on a fix).

When you increment a field, the fields to its right are reset to zero (SemVer
§7: `1.1.3 → 2.0.0`, not `2.1.3`).

### 5b. Pre-1.0 (`0.y.z`) — the initial development phase

SemVer §4: **major version zero (`0.y.z`) is for initial development. Anything
may change at any time. The public API should not be considered stable.**

Two implications for this project:

1. While `readme-harness` is `0.y.z`, adopting repos should treat every
   release as potentially breaking — this is expected and correct for the
   initial phase.
2. The first stable release is `1.0.0`: that is when the public module API and
   CLI are declared stable and downstream repos may confidently depend on them.

### 5c. Which field to raise (the decision)

The bump rule is a **decision about the nature of the change**, not a counting
exercise:

| Nature of change                     | bump | example         |
|--------------------------------------|------|-----------------|
| backward-compatible bug fix          | PATCH| `1.0.0 → 1.0.1` |
| backward-compatible new functionality| MINOR| `1.0.1 → 1.1.0` |
| incompatible API/behaviour change    | MAJOR| `1.1.0 → 2.0.0` |

Mapping to commit style (Conventional Commits): a `fix` → PATCH, a `feat` →
MINOR, a `BREAKING CHANGE` → MAJOR.

Three clarifying points:

- **Raise the *least significant* field that fits.** If in doubt between
  MINOR and PATCH, pick the field that matches the *semantics* of the change,
  never the one that merely makes the number bigger.
- **`0.y.z` has no special "PATCH at 100" rule.** The `0.y.z` phase drops the
  three-field discipline for stability but the bump *intent* still applies —
  add capabilities at `MINOR`, fix at `PATCH`, per §5a.
- **`1.0.0` is the stability commitment**, at which point the promise of
  backward compatibility begins in earnest. The `0.y.z` → `1.0.0` jump
explicitly freezes the surface.

### 5d. Automation (already wired)

- **`tools/version-check.mjs`** enforces *coherence* —
  `package.json.version === CHANGELOG newest === README badges` — so a release
  can never be half-applied. It does **not** choose the next number.
- **Choosing the number**: §5c decides *which field*; the change itself decides
  the delta. Bump all surfaces **in one commit** (`package.json`, a new
  `CHANGELOG.md` section, every README Version badge), then let CI prove it.

## 6. Language discipline

- **Main page**: `README.md`, written in English (en-GB) — the framework's
  default voice.
- **Other languages**: separate `README.<lang>.md` pages (e.g.
  `README.zh-CN.md`). Languages are not embedded inside the main page.
- New locales are added only when traction justifies them; a translation must
  be faithful to the culture, not a mechanical word-for-word pass.

## 7. Adopting a new repository

1. `cp -r skeleton/ <new-repo>`
2. Choose modules from `REGISTRY.md`; `cp -r module/<name> <new-repo>/`
3. `node tools/generate.mjs <new-repo>` — emits the README from skeleton +
   modules, and alongside it an `AGENTS.md` (AI working contract) plus, when
   the target declares any third-party deps, a `THIRD_PARTY_NOTICES.md` licence
   disclosure.
4. Wire `tools/version-check.mjs` into the new repo's CI.