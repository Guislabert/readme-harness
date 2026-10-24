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

Version coherence is a **framework-level guard**, enforced by
`tools/version-check.mjs` per project:

```
package.json.version === CHANGELOG newest section === README badges
```

- Version bumps are **release points**, not push points (SemVer).
- The guard runs in each adopting project's CI; it is not owned by any single
  module.

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