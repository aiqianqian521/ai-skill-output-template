# L1 — cspm 家族输出模板（分）

> 本文件在 L0 契约之上，定义 cspm（云安全态势管理）类 skill（skill-sas-cspm-report、skill-sas-baseline-aggregator）的输出结构。cspm 家族输出**多金样高性能服务渲染报告**：结构完全由服务端 render 强制，LLM 只写 narrative 四段。

## 一、家族定位

cspm 家族产出安全性合规报告（CIS/PCI/CIEM/KSPM/MLPS 等多套标准）。它是**结构最硬**的家族——报告由 `scripts/generate_*.py` 服务端 render，LLM 只填 narrative，模板层已近舍弃（templates 旧模板已标弃用 → 服务端 render）。

## 二、核心结构（六件套）

| 件 | 说明 |
|----|------|
| SKILL.md | 触发 + 工作流强约束 |
| prompts/ | 分析路径提示词 |
| reference/ | 标准映射、口径 |
| scripts/ | render 强制结构（主力） |
| templates/ | 旧模板（历史，标注弃用） |
| output/ | 多时间戳金样实例 |

### 输出报告结构（render 强制）
- frontmatter：L0 交集字段
- 统计矩阵：`covered N / partial N / N-A N / missing N`（renderer 逐项播算）
- 各标准/子项逐项结论（自动/不适用均带证据或复检触发）
- 风险分级：critical/high/medium/low，引用触发条件
- narrative：`p1_narrative` / `summary_narrative` / `key_findings` / `hardening_suggestion`

## 三、落盘
`output/{family}/{报告}_{YYYYMMDD_HHMMSS}.md`（多时间戳保留历史）。

## 四、金样
对照 `spec/L2-golden/cspm.md`。




