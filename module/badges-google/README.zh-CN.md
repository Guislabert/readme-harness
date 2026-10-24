# module/badges-google —— Google 四色徽章模块

**🌐 [English](README.md)**

可落地组件：为项目 README 页头渲染语义化的四格徽章行（CI · Version · npm · License）。

## 用途

让项目页头拥有一个一眼可读的徽章行，由 Google 四色语义色板驱动。这是
`SPEC.zh-CN.md §4` 定义的更广语义色板中的**一个实例** —— 不是写死的「只有四个」。

## 文件

| 文件 | 作用 |
|---|---|
| `google-badges.mjs`   | 审计 / `--fix` 一个项目的徽章行（4 色预设） |
| `README.md`           | 本模块卡 |

`version-check.mjs`（一致性守卫）属于**框架层级**，位于 `tools/`；本模块引用它
而非拥有它。

## 用法

```sh
# 把模块复制进项目
cp -r module/badges-google /path/project/module/badges-google

# 审计或重写徽章行
node module/badges-google/google-badges.mjs /path/project            # 预演
node module/badges-google/google-badges.mjs /path/project --fix      # 重写
```

## 扩展到 4 个以上徽章

当一个项目需要超过四个徽章时，**不要**随手重排这四个 Google 色。请从语义色板
（`SPEC.zh-CN.md §4`）扩展：

- success `#34A853` · info `#4285F4` · danger `#EA4335`
- warning `#FBBC05` · neutral `#5F6368`

把每个新徽章映射到它的**语义**（stars → neutral、coverage → success、
PRs → neutral、release → danger），并保持阅读顺序 `built → versioned →
published → licensed → meta`。

## 命名 / 版本

属于 Readme Harness v0.1.0。在 [`REGISTRY.zh-CN.md`](REGISTRY.zh-CN.md) 中登记为 `#1`。
License: MIT