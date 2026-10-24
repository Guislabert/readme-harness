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

### 5a. What a version bump means (SemVer 2.0.0)

Three fields, `MAJOR.MINOR.PATCH`, each counted independently. **Raise a field
and reset everything to its right to zero.** Raising a field is a *decision*,
not a milestone counter — numbers never "run up" for their own sake.

| If you…                              | bump | example          |
|--------------------------------------|------|------------------|
| fix a bug, backward-compatible       | PATCH| `1.0.1 → 1.0.2`  |
| add a feature, backward-compatible   | MINOR| `1.0.2 → 1.1.0`  |
| break a public/consumed behaviour    | MAJOR| `1.1.0 → 2.0.0`  |
| staying pre-1.0 (API not frozen)     | any  | `0.1.x → 0.2.0`  |

Common misconceptions this framework guards against:

- **PATCH at 100 is a smell, not a goal.** If a codebase is at `0.0.100` you
  shipped ~100 fixes without a backward-compatible feature/behavioural change —
  consider raising MINOR instead. Nothing is "better" for having a bigger
  number in a field.
- **`0.x.y` means "API not frozen".** Any `0.x` release may break without
  notice; readers should treat readiness as separate from stability.
- **`1.0.0` is the first stability claim**, not a fanfare. It says the public
  surface is committed and downstream can depend on it.

### 5b. A realistic advance ladder (Do not chase 0.0.100)

```
0.0.1 → 0.0.2 → 0.0.3          # bug fixes / micro-adjustments
    │  first capability lands
0.1.0 → 0.1.1 → 0.1.2          # one feature added, then fixes
    │  second capability lands
0.2.0                          # pushing toward a stable surface
    │  public surface agreed, prod-ready — make the promise
1.0.0 → 1.0.1 → 1.1.0 → 2.0.0 …
```

For **this** project, the practical progression looks like:

| Today | When you'd go there            | What justifies it                    |
|-------|--------------------------------|---------------------------------------|
| `0.0.1` | `0.0.2`                     | a bug fix / doc fix                   |
| `0.1.0` | a new capability (e.g. `hero-image`) | backward-compatible addition   |
| `1.0.0` | public module API + CLI considered stable | users may depend on it   |
| `1.1.0` | another additive capability  | backward-compatible feature           |
| `2.0.0` | a breaking change to module/CLI | consumers must migrate          |

### 5c. Automation (already wired)

- **`tools/version-check.mjs`** enforces *coherence* —
  `package.json.version === CHANGELOG newest === README badges` — so a release
  can never be half-applied. It does **not** pick the next number for you.
- **Guidance for picking the number**: the table in §5a decides *which field*;
  git history decides the *delta*. If the change is `fix`-class → PATCH,
  `feat`-class → MINOR, breaking → MAJOR (Conventional Commits mapping).
- Bump all surfaces **in one commit**: `package.json`, a new `CHANGELOG.md`
  section, and every README Version badge, then let CI prove it.

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
   modules.
4. Wire `tools/version-check.mjs` into the new repo's CI.