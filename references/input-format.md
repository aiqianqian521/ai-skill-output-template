# 通用输入契约（Input Format）

> 定义 renderer 统一接受的 JSON 输入 schema。不同家族共享同一份顶层结构，仅 `family` 与部分字段含义不同。

## 一、顶层 JSON Schema

```json
{
  "family": "architect",
  "project": "cspm-agent",
  "evaluatedAt": "2026-08-26",
  "archMap": [],
  "dimensions": [],
  "findings": [],
  "blockers": [],
  "skillAnalyses": [],
  "narratives": {}
}
```

## 二、字段约束

| 字段 | 类型 | family 相关差异 | 是否 renderer 计算 |
|------|------|----------------|-------------------|
| family | enum | architect / ooda / obsidian / cspm | 否（决定渲染分支） |
| project | string | 通用 | 否 |
| evaluatedAt | string(ISO) | 通用 | 否 |
| archMap | array | architect 必填；其余可省 | 否（LLM 从 Intake 填） |
| dimensions | array | architect/cspm 维度矩阵；ooda 为问题分级 | 部分（统计播算） |
| findings | array | 通用问题清单（id/level/title） | 否 |
| blockers | array | architect/cspm Critical 改进方案阻塞项 | 否 |
| skillAnalyses | array | architect 逐 skill 分析 | 否 |
| narratives | object | 通用四段 | 否（LLM 只写此处） |

### dimensions 元素
`{ "dim": "security", "status": "covered|partial|missing|not-applicable", "evidence": "config.yaml L5-16", "risk": "critical|high|medium|low", "trigger": "scheme 一.1" }`

### findings 元素
`{ "id": "C1", "level": "critical", "title": "钉钉凭证明文入库", "scheme": "scheme 一.1", "detail": "..." }`

## 三、使用约定
1. 结构表格由 renderer 从 arrays 计算，LLM 负责填证据文本。
2. **narrative 可含可视化代码块**：`narratives` 里任一字段（summary/architecture/taskFlow/usage 等）可内嵌 ```mermaid 代码块（flowchart / sequenceDiagram / timeline 等）。renderer 对 narrative 原样输出，mermaid 只放在 narrative 段，表格类结构交由 table/subs/stats。
3. 可视化是可选的：若查看器不支持 mermaid，正文须有能脱离图也能读懂的概括句。
2. 缺失的 required 数组会导致 renderer 报错或回落为占位符（更建议直接报错，防静默漂移）。
3. 校验：`node scripts/validate.mjs input.json` 通过后才允许 render。

