---
name: ai-skill-output-template
description: 通用 AI skill 输出模板/条约 v2（声明式多模板注册中心）。用于统一 architect、ooda、obsidian、cspm 及其他自定义 skill 的输出结构，保证「结构由 render 强制、分级可判定、证据可复核、金样可回归」。当用户要求统一某类 AI skill 输出格式、评审输出质量、或让多个 skill 各自套用不同输出模板、或给新服务建输出模板时使用。
---

# AI Skill 输出模板（v2 · 声明式多模板）

## 核心变化（相对 v1）

- **模板注册中心**：每个模板一个 `templates/<family>.<scene>.json`，描述段落结构 / frontmatter / narrative 校验 / 证据与分级门禁 / 金样。
- **声明驱动**：`render.cjs` 与 `validate.mjs` 都按模板声明工作，**新增技能或场景 = 新增一个 JSON，零改代码**。
- **强校验**：`validate.mjs` 不再只查格式，而是拦质量——四件套必填有实质、证据须行级来源、分级须引用 scheme 触发条件、`other` 桶饱和度、禁词。

## 目录
```
templates/               # 模板注册中心（每个 JSON = 一个输出模板）
templates/README.md      # 新增模板三步法 + 字段说明
scripts/render.cjs       # 声明驱动渲染器
scripts/validate.mjs     # 声明驱动强校验器
spec/L0-common.md        # L0 契约（跨家族硬约束）
spec/L1-<family>.md      # 各族 spec
spec/L2-golden/          # 各族金样
references/              # 分级/输入/禁词
samples/                 # 各族输入样例
tests/                   # unit + 强校验门禁 + e2e
```

## 常用命令
```bash
# 渲染（默认按 family 自动匹配；也可显式指定模板）
node scripts/render.cjs input.json --out output/<family>/<project>/<date>/report.md
node scripts/render.cjs input.json --template <id> --out report.md

# 强校验（好报告通过；空 narrative/缺证据/无分级引用 会被拦）
node scripts/validate.mjs report.md [--template <id>]

# 回归
node tests/test-universal-template.cjs   # 渲染+统计冒烟
node tests/test-validate-gates.mjs       # 强校验门禁回归
node tests/test-e2e.cjs                  # 端到端（四族+真实数据）落盘校验
```

## 内置模板
| id | family | 场景 |
|----|--------|------|
| `project.overview` | project | 完整项目介绍（架构图前置 + 设计者/使用者双视角） |
| `architect.single-report` | architect | 架构师单项目五段报告 |
| `cspm.report` | cspm | CSPM 安全合规报告 |
| `ooda.loop` | ooda | OODA 循环复盘（默认场景） |
| `ooda.incident` | ooda | OODA 故障处理（同族第二场景） |
| `obsidian.note` | obsidian | Obsidian 知识库笔记 |
> 特别地，project 族的 `successCriteria` narrative（成功判定机制 · 用户定义 · Loop 近跟）用于串联项目知识库的“设计初衷”，把“什么算成功”写明白（确定性结果如 1+1=2 一次命中，复杂目标按判定式可行性 loop 近跟）。

> 同族多场景：`ooda.loop` 与 `ooda.incident` 是两个模板，同一份输入可分别套用。默认匹配各 family 的 `"default": true` 模板；显式 `--template <id>` 精确指定。

## 如何给一个新服务建模板
1. 复制 `templates/architect.single-report.json` 为 `templates/<family>.<scene>.json`。
2. 改写 `frontmatter_required` / `narratives_required` / `sections` / `validation`（见 `templates/README.md`）。
3. `node scripts/render.cjs 输入.json --template <新id> --out 报告.md` + `node scripts/validate.mjs 报告.md --template <新id>`。
4. 新增 family 无需改 renderer：只要有对应模板（按 id/family/fallback_family 匹配）即可渲染；配套在 `spec/L1-<family>.md` 写家族规范、`spec/L2-golden/` 放金样、`samples/` 放样例（可参考 project 族）。


## 标题编号规范（技术论文式）

> 所有模板输出统一采用「技术论文式」编号标题，禁止混用不同标题风格、禁止使用 ① ② ③ 等圈号。
- 一级标题：`## 1. 标题`、`## 2. 标题`……（结论恒为 `## 1. 结论`）
- 二级标题：`### 1.1 标题`、`### 1.2 标题`……（在上级编号后追加 `.`序号）
- 三级标题：`#### 1.1.1 标题`、`#### 1.1.2 标题`……
- 三级封顶：不再生成四级及以上编号；需要更细分节时，直接用加粗小标题（`**小节名**`）或列表，不增加编号层级。
- 编号只做顺序标注，不重复章节名；如 `## 1. 结论`，正文不再重复“结论”二字作小标题。
- 用于修饰的 ASCII 符号（`·`、`—`）可在同一标题内出现，但不得替代编号本身。


## 硬约束（L0）
- 结构表格由 render 计算，LLM 只写 narrative。
- 交付四件套必含：结论 / 证据 / 风险分级 / 下一步。
- 分级必须引用 `references/grading-scheme.md` 触发条件编号。
- narrative 段可含 ```mermaid 代码块（架构图/流程图/时序图），renderer 原样输出；表格类结构仍由 render 计算。
- 禁止编造未验证数据；证据须行级来源；密钥脱敏。

## 关键说明
- 未知 `type`(findings) 会进 `type_unknown` 待复核，不降级映射（见 architect bundle 的 P0 修复经验）。
- 同一对象同一日期重评 = 新日期目录或覆写 state.md，保留历史对照。
