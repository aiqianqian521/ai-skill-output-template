# templates/ — 声明式模板注册中心

> 每个模板是一个自描述的 JSON 文件，描述「段落结构 / frontmatter / narrative 校验 / 证据与分级约束 / 金样」。
> **新增一个技能或场景 = 新增一个 JSON 文件，零改代码**。renderer 与 validator 都按这份声明驱动。

## 一、为什么做成「多模板可插拔」

之前是 `render.cjs` 里 `if (family === "architect") / else if ("ooda") ...` 硬编码。
新增一个技能 -> 改一次代码；同族多场景（如 ooda 复盘报告 vs 故障处理报告）无法表达。

现在改为「模板注册 + 声明驱动」：
- `render.cjs`：`node scripts/render.cjs input.json [--template <id>]`
  - 不指定 `--template` 时按输入 `family` 自动匹配第一个同族模板；无匹配则用内置 legacy 渲染兜底。
- `validate.mjs`：`node scripts/validate.mjs report.md [--template <id>]`
  - 按模板声明强校验：frontmatter 必填、narrative 实质内容、证据行级来源、分级触发条件引用、other 桶饱和度、禁词。

## 二、模板 JSON 字段说明

| 字段 | 说明 |
|------|------|
| id | 模板唯一 ID，如 `architect.single-report` |
| family | 所属技能族（architect/ooda/obsidian/cspm/...） |
| scene | 场景名（同族可多场景） |
| title | 人类可读标题 |
| fallback_family | 默认按此 family 匹配（供 render/validate 解析） |
| frontmatter_required | 输出 frontmatter 必须出现的字段（含家族特有如 obsidian 的 tags/aliases） |
| narratives_required | 交付四件套等必须填写的 narrative 字段（兼容校验，按英文 key 探测） |
| narratives_min_len | narrative 段有效内容最小长度（去 markdown 符号后） |
| sections | 段落声明（见下），决定渲染顺序与校验范围 |
| validation | 质量门禁开关（证据/分级/other饱和/禁词） |
| golden | 该模板对应金样文件（供回归） |

### sections[].kind 取值
- `narrative`：LLM 填写的一段叙述；`title`=渲染锚点，`field`=输入 narratives 字段。
- `table`：从 `rows` 数组渲染表格；`cols` 声明列（`h` 表头 / `f` 取值字段）。
- `subs`：从 `rows` 拆成多个 `###` 小节；`fields` 声明每个小节要展示的字段与标签。
- `stats`：从 `rows`（dimensions）计算风险/覆盖统计表。
- `list`：从 `rows` 渲染列表；`wiki:true` 时输出 `- [[item]]` Obsidian 双链。

> L0 强制：`## 结论`（来自 input.narratives.summary）总是第一个 narrative 段，所有模板通用，模型只填 summary。

> L0 标题规范（技术论文式）：`## N. 标题`/`### N.N`/`#### N.N.N`，三级封顶；结论恒为 `## 1. 结论`；禁止圈号（①②③）、禁止混用标题风格。

## 三、如何给一个新服务建模板（三步）

1. **复制** `templates/architect.single-report.json` 为 `templates/<family>.<scene>.json`。
2. **改写** frontmatter_required / narratives_required / sections（段落标题、字段、统计）与校验门禁。
3. **渲染+校验**：
   ```bash
   node scripts/render.cjs 你的输入.json --template <新id> --out output/<family>/<project>/<date>/report.md
   node scripts/validate.mjs output/<family>/<project>/<date>/report.md --template <新id>
   ```

## 四、当前内置模板

| id | family | 场景 |
|----|--------|------|
| project.overview | project | 完整项目介绍（架构图前置 + 设计者/使用者双视角） |
| architect.single-report | architect | 架构师单项目五段报告 |
| cspm.report | cspm | CSPM 安全合规报告 |
| ooda.loop | ooda | OODA 循环过程产物 |
| obsidian.note | obsidian | Obsidian 知识库笔记 |
> project 族的 `successCriteria` narrative（成功判定机制 · 用户定义 · Loop 近跟）是“设计初衷与知识库互通”的接口：把项目知识库里关于“什么算成功”的设计写明白（确定性结果如 1+1=2 一次命中，复杂目标按判定式可行性 loop 近跟）。

> 想再区分「ooda 复盘」与「ooda 故障处理」？各建一个 `ooda.retro.json` / `ooda.incident.json` JSON 即可，不用改 render.cjs。
