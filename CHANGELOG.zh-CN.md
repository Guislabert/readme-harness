# 变更日志

**🌐 [English](CHANGELOG.md)**

这里记录 Readme Harness 的所有重要变更。遵循
[Keep a Changelog](https://keepachangelog.com) 与 SemVer；`package.json.version`、
最新的 `## [x.y.z]` 小节、以及每个 README 的 Version 徽章必须始终一致
（由 `tools/version-check.mjs` 在 CI 中强制检查）。

## [0.1.0] — 2026-10-24

初始发布。首个能力级版本：一个可用、尚未稳定承诺的框架，而非空脚手架。

### 新增（Added）
- `badges-meta` 模块 —— 带阈值门控的 GitHub 元数据徽章（stars · PRs ·
  downloads）；只有当某个指标跨过阈值时才渲染（`SPEC.md §4a`）。
- `scripts/ci-badges-meta.sh` + `.github/workflows/ci.yml` —— CI 在每次 push/PR
  时运行版本链守卫、徽章行审计、`badges-meta` 健全性检查，以及一次生成器走查。
- 框架脚手架：`module/`、`skeleton/`、`tools/`、`REGISTRY.md`、`SPEC.md`。
- `badges-google` 模块 —— Google 四色徽章行（CI · Version · License），通过
  `module/badges-google/` 落地，可从语义色板扩展。
- 超出四色时的语义色板（`SPEC.md §4`）。
- `tools/generate.mjs` —— 一键 README 生成器，带自动检测
  （语言/依赖清单、版本、CI、模块、`git remote` 的 owner/repo）。
- `tools/version-check.mjs` —— 版本链一致性守卫。
- 英文（en-GB）主展示页以及独立的简体中文页面。

### 变更（Changed）
- `google-badges.mjs` —— 修复非 ASCII 标签渲染（双连字符标签）。

### 新增（i18n）
- 每份英文文档的简体中文版：`SPEC.zh-CN.md`、
  `REGISTRY.zh-CN.md`、`CHANGELOG.zh-CN.md`，以及两个模块卡中文版
  `module/badges-google/README.zh-CN.md` 与 `module/badges-meta/README.zh-CN.md`。
- `assets/hero-{light,dark}.svg` —— 随主题自适应的首图（ClawBench 式衬线标题 +
  渐变背景 + 胶囊标签），通过 `<picture>` 置于两个 README 页顶部。