# L1 — architect 家族输出模板（分）

> 本文件在 L0 契约之上，定义 architect 家族（architect-security / architect-git / architect-net 等架构评估类 skill）的输出结构。核心是 **[五段结构]，结构由 render.cjs 强制，LLM 只写 narrative**。

## 一、家族定位

architect 家族做「代码/架构静态评估」。它输出的是**对别人代码的问题清单 + 风险分级 + 改进方案**，不是可运行的产物。

## 二、五段结构（renderer 强制顺序）

| 段 | 标题 | renderer 计算 vs LLM 填写 | 字段来源 |
|----|------|--------------------------|---------|
| ① | 项目架构地图（每目录职责） | renderer 生成表格 | `archMap[]` |
| ② | 维度覆盖矩阵 | renderer 计算状态/风险 | `dimensions[]` |
| ③ | 各 skill 详细分析 | renderer 拆小节，LLM 填原则/证据/下一级 | `skillAnalyses[]` |
| ④ | 问题点汇总统计（cspm 风格） | **renderer 计算**，非 LLM 主观 | `dimensions[]`+`findings[]` |
| ⑤ | 改进方案 — Critical/High 阻塞项详述 | renderer 拆小节 | `blockers[]` |

### 覆盖状态口径
- **covered**：有 Intake 实读证据（文件+行号或目录+计数），结论站稳。
- **partial**：有覆盖但存在缺口，标最高缺口等级。
- **missing**：完全未覆盖 / 该有而没有，标风险等级。
- **not-applicable**：对本项目不适用，**必须带复检触发条件**（什么情况下要重查）。

### 风险分级口径
每维/每问题必须引用 `references/grading-scheme.md` 触发条件编号，取最高命中，禁止主观词。

## 三、frontmatter（L0 交集 + architect 特有）
```yaml
skill_family: architect
skill_name: architect-security   # 单 skill
tier: L2                          # 单项目报告
---
```

## 五、落盘
- 单项目：`output/architect/{project}/{YYYY-MM-DD}/report.md`
- 自评（skills 元评估）：留 `docs/`，不混入项目输出。

## 六、金样
对照 `spec/L2-golden/architect.md`（2026-08-26 cspm-agent v3 五段结构实例）。

