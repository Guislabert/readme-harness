# Readme Harness —— 框架规范

**🌐 [English](SPEC.md)**

> 标准化的、模块化的项目 **README / Landing 页**撰写规范。
> 主展示页用英文（en-GB）书写；中文页面：`README.zh-CN.md`。

## 1. 目的（Purpose）

Readme Harness 是每个新仓库落地页的**基础层（base layer）**。它把三件事分开：

- **骨架（skeleton）** —— 页面*结构*（小节顺序、占位符）；
- **模块（modules）** —— 页面*组件*（徽章行、标签、首图…），每个可独立落地；
- **注册表（registry）** —— 提供什么、落在哪里的*目录表*。

## 2. 目录布局（Layout）

```
readme-harness/
├── README.md          主展示页，用英文（en-GB）书写
├── README.zh-CN.md    简体中文独立页面
├── SPEC.md            本文件
├── REGISTRY.md        模块注册表（单一信息源）
├── module/            每个模块一个可落地目录
├── skeleton/          可复制的带注释骨架
├── tools/             框架工具（生成器、守卫）
└── LICENSE
```

## 3. 模块（Modules）

- **模块**是一个自包含组件，以目录形式落地到项目中（见 [`REGISTRY.zh-CN.md`](REGISTRY.zh-CN.md)）。
- 每个模块必须自带 `README.md` —— 一张**模块卡（module card）**，说明其用途、目标展示在小节、以及如何扩展。
- 模块是**可选的**；一个项目可以包含零个、一个或多个模块。
- 模块名有版本约束并登记在注册表中；模块绝不静默改名。

## 4. 颜色语义（Colour semantics）

颜色是**语义化**的，而非装饰。`badges-google` 内置 Google 四色预设：

| 位置      | 颜色  | 色值       | 语义                          |
|-----------|--------|-----------|-------------------------------|
| CI        | 绿    | `#34A853` | 构建/CI 状态                  |
| Version   | 蓝    | `#4285F4` | 项目核心标识（版本）          |
| npm 版本  | 红    | `#EA4335` | 已发布的产物                  |
| License   | 黄    | `#FBBC05` | 温暖的收尾（静态）            |

阅读顺序遵循：**built → versioned → published → licensed**（构建 → 版本 → 发布 → 许可）。
当项目需要超过四个徽章时，请从**语义色板**（见下）扩展，而不是随手重用这四色。

| 语义    | 色值     | 用途                                     |
|----------|---------|------------------------------------------|
| success  | `#34A853` | 构建/测试通过、覆盖率                   |
| info     | `#4285F4` | 版本/标识、链接                          |
| danger   | `#EA4335` | 已发布产物、发布                         |
| warning  | `#FBBC05` | 静态/许可、温暖收尾                     |
| neutral  | `#5F6368` | 元数据（stars、downloads、PR 数）       |

## 4a. 徽章展示纪律（为什么不是每次每个徽章都展示）

徽章只在它**真实且有用**时才展示。两个常见情况：

- **npm / 已发布产物徽章** —— 只有当产物真的发布到了某个注册表时才展示
  （配置了 `npmPackage` → 指向真实页面）。本框架是 **Git-first、npm-never**，
  因此默认不渲染任何 npm 徽章。一个假的 `0 downloads` / 不存在的包徽章会损伤
  可信度；只有当包真的存在时才加。
- **Stars / GitHub-meta 徽章** —— 只有当仓库跨过**阈值**（默认 `100`）才展示。
  全新仓库 `0 stars` 看着很空洞，所以 `badges-meta` 会延迟渲染，直到数值有意义。
  阈值可按项目配置。

阅读顺序仍保持 `built → versioned → published → licensed → meta`；被隐藏的徽章
只是从徽章行中**消失**（SSR，而不是留下一个空占位符）。

## 5. 版本纪律（Version discipline）

参考：**[SemVer 2.0.0](https://semver.org/)** —— 本框架遵循的权威规范。
`tools/version-check.mjs`：
`package.json.version === CHANGELOG 最新小节 === README 徽章`。

### 5a. 一次版本提升意味着什么（SemVer 2.0.0）

SemVer 定义了三个位，`MAJOR.MINOR.PATCH`：

- **MAJOR** —— 当你做出**不兼容**的 API 变更时递增
  （破坏性变更时 `1.0.0 → 2.0.0`）。
- **MINOR** —— 当你以**向后兼容**的方式新增功能时递增
  （新特性时 `1.0.0 → 1.1.0`）。
- **PATCH** —— 当你做出**向后兼容的 bug 修复**时递增
  （修复时 `1.0.0 → 1.0.1`）。

当你递增某一位时，其右侧的所有位都归零（SemVer §7：`1.1.3 → 2.0.0`，而非 `2.1.3`）。

### 5b. 1.0 之前（`0.y.z`）—— 初始开发阶段

SemVer §4：**主版本零（`0.y.z`）用于初始开发。任何内容随时都可能改变。
公开 API 不应被视为稳定。**

对本项目有两个含义：

1. 当 `readme-harness` 处于 `0.y.z` 时，采纳该框架的仓库应把每次发布都视为潜在
   破坏性变更 —— 这对初始阶段是预期且正确的。
2. 首个稳定发布是 `1.0.0`：那是公开模块 API 和 CLI 被声明为稳定、下游仓库可以
   放心依赖它们的时刻。

### 5c. 该升哪一位（决策）

升版规则是对**变更性质**的决策，而不是数数字：

| 变更性质                                    | 升位  | 示例             |
|---------------------------------------------|-------|------------------|
| 向后兼容的 bug 修复                        | PATCH | `1.0.0 → 1.0.1`  |
| 向后兼容的新功能                            | MINOR | `1.0.1 → 1.1.0`  |
| 不兼容的 API / 行为变更                     | MAJOR | `1.1.0 → 2.0.0`  |

与提交风格的映射（Conventional Commits）：`fix` → PATCH，`feat` → MINOR，
`BREAKING CHANGE` → MAJOR。

三点澄清：

- **在 MINOR 和 PATCH 拿不准时，升「最低有效位」与其语义相符的那一位** —— 永远
  不要因为想让数字变大而升。
- **`0.y.z` 并没有特殊的「PATCH 到 100」规则。** `0.y.z` 阶段在稳定性上放宽了
  三位的纪律，但升位*意图*依然适用 —— 加能力升 `MINOR`、修 bug 升 `PATCH`，
  见 §5a。
- **`1.0.0` 是稳定性承诺**，从那一刻起向后兼容的承诺才真正开始生效。`0.y.z` →
  `1.0.0` 的这一步显式冻结了对外表面。

### 5d. 自动化（已接线）

- **`tools/version-check.mjs`** 强制*一致性（coherence）* ——
  `package.json.version === CHANGELOG 最新 === README 徽章` —— 因此一次发布
  永远不会「只改了一半」。它**不替你**选择下一个版本号。
- **选择版本号**：§5c 决定升*哪一位*；变更本身决定增量。所有表面上**用一次提交**
  一起升（`package.json`、一条新的 [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md) 小节、每个 README 的 Version
  徽章），然后交给 CI 去验证。

## 6. 多语言纪律（Language discipline）

- **主展示页**：`README.md`，用英文（en-GB）书写 —— 框架的默认语态。
- **其他语言**：单独的 `README.<lang>.md` 页面（例如 `README.zh-CN.md`）。
  各种语言不嵌入主展示页内。
- 只有当项目有足够关注度时，才新增语言环境；翻译必须**信达雅、贴合该文化语境**，
  而不是机械地逐词对译。

## 7. 采纳一个新仓库（Adopting a new repository）

1. `cp -r skeleton/ <new-repo>`
2. 从 [`REGISTRY.zh-CN.md`](REGISTRY.zh-CN.md) 选模块；`cp -r module/<name> <new-repo>/`
3. `node tools/generate.mjs <new-repo>` —— 从骨架 + 模块生成 README；同时在旁边
   产出 `AGENTS.md`（AI 工作契约），以及（当目标声明了任何第三方依赖时）
   `THIRD_PARTY_NOTICES.md` 许可证披露。
4. 把 `tools/version-check.mjs` 接进新仓库的 CI。