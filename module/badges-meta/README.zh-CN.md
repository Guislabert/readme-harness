# module/badges-meta —— 元数据徽章（stars · downloads）带阈值门控

**🌐 [English](README.md)**

可落地组件：渲染**可选、阈值门控**的 GitHub 元数据徽章（stars、PRs、downloads），
用于项目 README 页头。

## 用途

让项目页头展示真实的 GitHub 指标 —— 但**只有当它们值得展示时才显示**。全新仓库
`0 stars` 什么都不显示，而不是一个空洞的 `stars 0`；徽章只有在跨过项目级阈值后
才出现。

## 阈值策略

| 指标   | 颜色    | 默认阈值 | 规则                                   |
|----------|---------|-----------|----------------------------------------|
| Stars    | neutral | `100`     | 仅当 `stars >= 阈值` 时渲染            |
| PRs      | neutral | `50`      | 仅当 `open_prs >= 阈值` 时渲染         |
| npm 下载 | danger  | `500`     | 仅当产物已发布时渲染                   |

阈值用 `--threshold-stars 100` 这类标志，按项目覆盖。低于阈值时徽章只是从徽章行中
**消失**（SSR，而不是留一个空位）—— 与 `SPEC.zh-CN.md §4a` 一致。

## 文件

| 文件 | 作用 |
|---|---|
| `badges-meta.mjs`   | 通过 API 读取 GitHub 仓库指标、门控 + 渲染徽章行 |
| `README.md`         | 本模块卡 |

本模块**独立**于 `badges-google`（在阅读顺序中位置不同），也独立于
`version-check.mjs`。

## 用法

```sh
# 把模块复制进项目
cp -r module/badges-meta /path/project/module/badges-meta

# 为 owner/repo 渲染带门控的元数据徽章
node module/badges-meta/badges-meta.mjs owner/repo \
  --threshold-stars 100 --threshold-prs 50 --threshold-dl 500
```

通过 `GITHUB_OWNER`/`--owner` 设置真实的 owner/repo，或在仓库内运行时让它从
`git remote` 继承。

## 命名 / 版本

属于 Readme Harness v0.1.0。在 [`REGISTRY.zh-CN.md`](REGISTRY.zh-CN.md) 中登记为 `#2`。
License: MIT