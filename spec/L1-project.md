# L1 — project 家族输出模板（完整项目介绍）

> 本文件在 L0 契约之上，定义 project 家族（完整项目介绍 / 全景文档）的输出结构。
> 目标是让**别人只看这一份文档就能完整了解一个项目**：能运行、能查询、能知道它怎么自主 loop、后续怎么发展。
> 结构与 architect 一样由 render.cjs 强制，但本章节序专门面向「对外介绍」。

## 一、家族定位

project 家族做「完整项目介绍」。它不是问题清单，而是**项目说明书**：定位 → 全景架构 → 模块地图 → 任务流程 → 质量现状 → 阻塞项 → 使用手册 → 规划。适合：给新同事/用户/评审看、README 级文档、会议汇报。

## 二、章节顺序（renderer 强制，可配置顺序存量）

| 段 | 标题 | 谁填 | 说明 |
|----|------|------|------|
| 结论 | `## 结论` | LLM（summary） | L0 强制第一段，一句话定位 + 关键指标 |
| ① | 架构分层与模块地图 | renderer 表格 | `archMap[]`，层/模块 → 职责 → 证据 |
| ② | 任务运行与自主 loop 流程 | LLM（taskFlow narrative） | 含多张 mermaid：怎么运行 / 怎么自主 loop 时序 / 怎么查询历史 |
| ③ | 成功判定机制 · 用户定义成功 · Loop 近跟 | LLM（successCriteria narrative） | 显式写明“什么算成功”的判定式、例如确定性结果(1+1=2)一次命中、复杂目标按判定式可行性 loop 近跟（必含 mermaid） |
| ④ | 质量维度覆盖矩阵 | renderer | `dimensions[]`，状态 + 证据 + 风险（引用 scheme） |
| ⑤ | 各模块详细分析 | renderer 拆小节 | `skillAnalyses[]`：原则/证据/风险/下一步 |
| ⑥ | 问题点汇总统计 | **renderer 计算** | 来源于 `dimensions[]` |
| ⑦ | 改进方案 — 阻塞项详述 | renderer 拆小节 | `blockers[]`：现象/根因/影响/验证 |
| ⑧ | 使用者视角 · 运行/查询/自主 loop | LLM（usage narrative） | 完整命令速查、环境准备、常见任务路径 |
| 尾 | 关键发现 / 加固建议 / 下一步 | LLM | `keyFindings` / `hardening` / `nextSteps` |

> 顺序默认「架构图在前 + 任务流程在前」，之后才进入质量/问题/规划。若某项目无「问题」内容，⑤⑥可填空并注明。

## 三、Mermaid 可视化规范（narrative 内直写）

- 架构图 / 流程图 / 时序图用 ```mermaid 代码块写在 narrative 字段内容里，renderer 原样输出。
- 推荐图型：总体架构用 `flowchart`；一轮 loop 的参与者交互用 `sequenceDiagram`；操作路径用 `flowchart LR`；历史规划用 `timeline`。
- 图只在 narrative 段（架构/任务流程），表格类场景仍交给 renderer 的 table/subs。
- 查看器不支持 mermaid 时，正文须有一句话概括图意（fallback 可读性）。

## 四、双视角书写要求

- **设计者视角**（任务流程段）：讲「任务怎么被编排、自主 loop 每一轮做了什么、状态如何沉淀」。
- **使用者视角**（使用手册段）：讲「我作为用户，怎么运行一次任务、怎么查询历史、怎么触发连续 loop 或恢复」，落到具体 CLI 命令与预期输出。
- 两者必须有其实质内容，不能一句带过。

## 五、frontmatter（L0 交集 + project 规格）

```yaml
skill_family: project
skill_type: full-project-overview   # project-overview 模板场景
project: <project-name>
evaluatedAt: "YYYY-MM-DD"
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
```

## 六、落盘

- 单项目：`output/project/{project}/{YYYY-MM-DD}/report.md`
- 样例输入：`samples/project.overview.input.json`
- 金样：`spec/L2-golden/project-overview.md`

## 七、金样

对照 `spec/L2-golden/project-overview.md`（2026-09-01 loop-dev 完整项目介绍实例）。
