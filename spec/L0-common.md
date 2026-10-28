# L0 — AI Skill 通用输出元结构（总纲）

> 本文件是**通用 AI 输出模板的总纲**，抽象 architect · ooda · obsidian · cspm 四族 AI skill 输出结构的共同内核。任何接入本模板的 skill（包括 cspm_agent 中自己建的 skill）都必须满足本层约束。L1 家族层在 L0 之上叠加差异化章节，L2 金样层固化各家族的落地形态。

## 一、核心主张（结论先行）

**AI skill 的输出质量瓶颈不在模型写得多认真，而在结构是否被代码强制、分级是否可判定、证据是否可复核。** 因此总纲层收敛为四条跨家族硬约束：

| # | 硬约束 | 含义 | 违反的后果 |
|---|--------|------|-----------|
| C1 | **结构由代码 render 强制** | 元结构（表格/统计/清单）由 `scripts/render.cjs` 从结构化输入生成；LLM 只写 narrative 四段（结论/关键发现/加固建议/下一步） | 结构随模型心情漂移，无法回归 |
| C2 | **交付四件套必含** | 每个评估/分析输出必须含：结论 / 证据 / 风险分级 / 下一步 | 缺任一件套即无法独立决策 |
| C3 | **分级必须引用量化触发条件** | 风险等级不得靠主观词，必须引用 `references/grading-scheme.md` 的触发条件编号 | 分级不可判定，跨轮无法回归 |
| C4 | **禁止编造未验证数据** | 行级证据必须来自真实读取；无证据的推断必须显式标 `[假设]` | 金样回归失真，放大泄露风险 |
| C5 | **narrative 可含 mermaid 可视化** | 图型放 narrative，结构仍由 render；禁凭空画未验证架构 | 读者被误导 / 图与正文不一致 |

## 二、frontmatter 契约

每个输出文件头部 YAML frontmatter 字段必须齐全：

```yaml
---
skill_family: architect | ooda | obsidian | cspm
skill_name: architect-security
project: cspm-agent
evaluatedAt: "2026-08-26"
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered | partial | missing | not-applicable
---
```

> obsidian 家族会叠加 `tags` / `aliases` / 双链字段（见 L1-obsidian），但上表字段为 L0 强制交集。

## 三、交付四件套（L0 C2 展开）

任何输出都必须包含以下四段，顺序固定：

### ① 结论（结论先行）
- 先给判断，再给证据；一句话能答完不放段落。
- 区分 **事实 / 判断 / 假设** 三种来源，禁止混为一谈。
- 事实带行级来源；判断给推导依据；假设显式标注 `[假设推断]`。

### ② 证据（证据链）
- 每条命中维度或问题，必须附 `文件路径 + 行号` 或 `目录 + 计数/大小` 级证据。
- 禁止把推断当证据；未读文件需在证据附录列出并标注。
- 涉及密钥等敏感证据输出须脱敏（值掩码）；脱敏不影响定位（保留行号和字段名）。

### ③ 风险分级（带触发条件）
- 风险等级取自 `references/grading-scheme.md`，并引用触发条件编号。
- 例：`critical（scheme §一①：明文密钥入库）`，禁止只写 `critical`。
- 分级只展示等级+触发条件，不展示内部权重评分（防虚假精确）。

### ④ 下一步（可执行 + 验证门禁）
- 每条下一步必须：有具名负责人 / 有可执行动作 / 有验证命令 / 有响应时间。
- 泛泛而谈不算下一步；必须落到命令或明确验收条件。

## 三之二、可视化（C1 扩展）

- **narrative 内嵌 mermaid**：架构图 / 流程图 / 时序图 / 时间线用 ```mermaid 代码块写在 narrative 字段里，
  renderer 原样输出。它不算"表格结构"，不违反 C1（结构表格仍由 render 计算）。
- 放置原则：想让读者"先看全貌再看细节"时，架构图放在结论之后第一段（如 project 族）。
- fallback：查看器不支持 mermaid 时，同段须有可脱离图读懂的概括句。

## 四、输入契约（C1 的前提）

renderer 接受单份 JSON 输入，schema 见 `references/input-format.md`。统一为：

```json
{
  "family": "architect",
  "project": "cspm-agent",
  "archMap": [{ "dir": "src/agent", "role": "...", "evidence": "src/agent/generic_agent.py 47KB" }],
  "dimensions": [{ "dim": "security", "status": "missing", "evidence": "config.yaml L5-16", "risk": "critical", "trigger": "scheme §一①明文密钥" }],
  "findings": [{ "id": "C1", "level": "critical", "title": "..." }],
  "narratives": { "summary": "...", "keyFindings": "...", "hardening": "...", "nextSteps": "..." }
}
```

LLM 的角色是填 `narratives` + 提供 `archMap` / `dimensions` / `findings` 的证据字段；结构表格由 renderer 从结构化输入计算。**禁止 LLM 直接产出报告正文表格**。

## 五、禁止编造协议（C4 展开）
1. **只读分析不改源码**：评估类 skill 是只读分析，不修改被评项目配置。
2. **密钥脱敏**：明文发现即 critical（不因“个人项目”豁免），证据脱敏展示。
3. **假设显式化**：任何“机制上成立但未实测”的推断须标记「机制推断」，不写成事实。
4. **金样回归**：新输出须对照 `spec/L2-golden/` 同家族金样，确认等级、触发条件引用、统计口径一致。

## 六、落地路径约定
renderer 按家族落盘（C1 强制），命名规范在 `L1-<family>.md` 里定义：
- architect 单项目：`output/{family}/{project}/{YYYY-MM-DD}/report.md`
- ooda 循环产物：`work_ooda/{YYYYMMDD-HHMMSS}-{任务名}/0{N}-第{N}轮.md`
- obsidian 知识库：接受 `--path` 指向 vault 目标目录
- cspm 安全报告：`outputs/{family}/{报告类型}_{YYYYMMDD_HHMMSS}.md`

> 统一原则：同一对象同一日期重评，architect/cspm 用新日期目录，ooda 用覆写 state.md；保留历史对照，不覆盖金样。
