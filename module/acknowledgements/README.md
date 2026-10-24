# Module: acknowledgements

An optional **reference / credit** section for a README — used only when a
project actually references or is inspired by another project. Empty content
means the section is simply omitted; it is never force-added.

## Purpose

Give credit where it is due without bloating an unrelated page. A README may
declare *who it inherits a technique, layout, or idea from* — the harness
itself, a specific framework (e.g. DeepSeek-Harness, ClawBench), or any prior
art — and the reference appears only when the project genuinely owes something.

## Target section

`## Acknowledgements` (by convention placed just before `## License`, or after
`## Adopting / Contributing` if the project wants credits near the meta).

## Usage

```markdown
## Acknowledgements

- Header layout inspired by [readme-harness](https://github.com/Guislabert/readme-harness) (v0.1.0, commit `8c65495`).
- Method influenced by [dbskill](https://github.com/dontbesilent2025/dbskill).
- Landing layout drawn from [ClawBench](https://clawbench.dev).
```

Only the rows that are true for this project are kept. No reference → no section.

## Extend

- Add a per-source format helper later (e.g. credit + commit + link) if many
  projects reuse the same upstream set.
- Keep it small: it is a **credit list**, not a bibliography — one line per
  source, with a link and (optionally) the version/commit relied on.