# module/badges-google — Google Four-Colour Badge Module

Landable component that renders a semantic four-badge row (CI · Version ·
npm · License) for a project README header.

## Purpose

Give a project's header an instantly readable badge row, driven by the
Google four-colour semantic palette. This is **one instance** of the broader
semantic palette defined in `SPEC.md §4` — not a hard-coded "only four".

## Files

| File | Role |
|---|---|
| `google-badges.mjs`   | audit / `--fix` a project's badge row (4-colour preset) |
| `README.md`           | this module card |

`version-check.mjs` (the consistency guard) is **framework-level** and lives
in `tools/`; this module references it rather than owning it.

## Usage

```sh
# copy the module into a project
cp -r module/badges-google /path/project/module/badges-google

# audit or rewrite the badge row
node module/badges-google/google-badges.mjs /path/project            # dry-run
node module/badges-google/google-badges.mjs /path/project --fix      # rewrite
```

## Extending beyond 4 badges

When a project needs more than four badges, do **not** re-use the Google four
ad hoc. Extend from the semantic palette (`SPEC.md §4`):

- success `#34A853` · info `#4285F4` · danger `#EA4335`
- warning `#FBBC05` · neutral `#5F6368`

Map each new badge to its **semantic** (stars → neutral, coverage → success,
PRs → neutral, release → danger) and keep the read order `built → versioned →
published → licensed → meta`.

## Naming / version

Part of Readme Harness v0.1.0. Registered as `#1` in `REGISTRY.md`.
License: MIT