# L1 — ooda 家族输出模板（分）

> 本文件在 L0 契约之上，定义 ooda 循环式 skill 的输出结构。与 architect 的「评估清单」不同，ooda 家族输出的是**带状态推进的过程产物**：每轮诊断/决策/验证的轨迹，以及跨轮连续性的 state 文件。

## 一、家族定位

ooda 做「强制 OODA 执行循环推进任务」。它不产出单一报告，而是产出一系列**过程文件 + 每轮报告 + 最终 summary**，解决的是「复杂模糊任务如何被验证解决」。

## 二、核心结构（L0 之上叠循环产物）

| 文件 | 角色 | 是否交付物 |
|------|------|-----------|
| `00-目的.md` | 目的 / 成功标准 / 约束 / 理解回执 / 5W1H / U&Q | 过程 |
| `state.md` | 跨轮唯一真相源，每轮覆写 | 检查点（必写） |
| `0{N}-第{N}轮.md` | 每轮 Observe/Orient/Decide/Act/Verify | 过程 |
| `summary.md` | 总轮次 + 每轮摘要 + 成功标准验收 | 最终交付 |

### 分级口径（cspm 风格）
每轮问题分级沿用 `references/grading-scheme.md` 四级：critical / major / minor / cosmetic。
- critical：阻碍目标 → 本轮必须修
- major：影响质量但不阻塞 → 本轮优先修
- minor / cosmetic：可记录到下一轮或延后

## 三、frontmatter（L0 交集 + ooda 特有）
```yaml
skill_family: ooda
skill_name: ooda-<具体skill>          # 具体 skill
round: 1                          # 当前轮次
---
```

## 四、落盘
- `work_ooda/{YYYYMMDD-HHMMSS}-{任务名}/` 下。目录是工作台，**不是交付物目录**，实际交付物写项目约定位置。

## 五、金样
对照 `spec/L2-golden/ooda.md`。



