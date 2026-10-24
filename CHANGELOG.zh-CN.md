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
  downloads）；只有当某个指标跨过阈值时才渲染（`SPEC.zh-CN.md §4a`）。
- `scripts/ci-badges-meta.sh` + `.github/workflows/ci.yml` —— CI 在每次 push/PR
  时运行版本链守卫、徽章行审计、`badges-meta` 健全性检查，以及一次生成器走查。
- 框架脚手架：`module/`、`skeleton/`、`tools/`、`REGISTRY.md`、`SPEC.md`。
- `badges-google` 模块 —— Google 四色徽章行（CI · Version · License），通过
  `module/badges-google/` 落地，可从语义色板扩展。
- 超出四色时的语义色板（`SPEC.zh-CN.md §4`）。
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

### 新增（AI + Harness）
- `tools/generate.mjs` 现在会在 README 之外同时生成一份 **`AGENTS.md`**
  （AI 工作契约）—— DeepSeek-Harness 式的指南，让打开该仓库的编码代理无需提醒
  就能了解其 README 纪律、SemVer 升版规则与模块清单。
- `tools/generate.mjs` 会自动检测被套用仓库的第三方依赖，并生成一份
  **`THIRD_PARTY_NOTICES.md`** 披露文件（对标 DeepSeek-Harness），让新仓库
  从一开始就满足许可证再分发合规。

### 修复（Fixed）
- `badges-meta.mjs` —— 移除失效的实时 GitHub API 分支（同步 `fetch` 在脚本
  退出前永远无法返回，因此静默地变成了 no-op）。指标现在必须通过 `--data`
  提供；徽章标签已做 URL 编码。
- `tools/generate.mjs` —— THIRD_PARTY_NOTICES 模板改用与全文件一致的真实换行；
  新增**版本一致性提示**，让被套用仓库的 CHANGELOG / package.json / README
  徽章从一开始就保持同步。
- `tools/version-check.mjs` —— 删除无用的 no-op 占位注释。

### 文档（Docs）
- README / SPEC（en + zh-CN）现在说明 `generate` 还会产出 `AGENTS.md` 以及
  （有第三方依赖时）`THIRD_PARTY_NOTICES.md`。
- 新增 `.gitignore`。