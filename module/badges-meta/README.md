# module/badges-meta — Meta Badges (stars · downloads) with Threshold Gate

Landable component that renders **optional, threshold-gated** GitHub-meta badges
(stars, PRs, downloads) for a project README header.

## Purpose

Give a project's header the real GitHub metrics — but **only once they are worth
showing**. A fresh repo at `0 stars` shows nothing, not a hollow `stars 0`;
the badge appears only after crossing a per-project threshold.

## Threshold policy

| Metric   | Colour   | Default threshold | Rule                                    |
|----------|----------|-------------------|-----------------------------------------|
| Stars    | neutral  | `100`             | render only when `stars >= threshold`   |
| PRs      | neutral  | `50`              | render only when `open_prs >= threshold`|
| npm dl   | danger   | `500`             | render only when artifact is published  |

Thresholds are `--threshold-stars 100` style flags; override per project. Below
threshold the badge simply **drops out** of the row (SSR, not a blank slot) —
consistent with `SPEC.md §4a`.

## Files

| File | Role |
|---|---|
| `badges-meta.mjs`   | read GitHub repo metrics via API, gate + render badge row |
| `README.md`         | this module card |

This module is **independent** of `badges-google` (different slot in the read
order) and independent of `version-check.mjs`.

## Usage

```sh
# copy the module into a project
cp -r module/badges-meta /path/project/module/badges-meta

# render gated meta badges for owner/repo
node module/badges-meta/badges-meta.mjs owner/repo \
  --threshold-stars 100 --threshold-prs 50 --threshold-dl 500
```

Set the real owner/repo via `GITHUB_OWNER`/`--owner`, or let it inherit from
`git remote` when run inside the repo.

## Naming / version

Part of Readme Harness v0.0.1. Registered as `#2` in `REGISTRY.md`.
License: MIT