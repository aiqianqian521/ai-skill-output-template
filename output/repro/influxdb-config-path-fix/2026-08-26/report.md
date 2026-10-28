---
skill_family: architect
skill_name: architect-security
project: influxdb-config-path-fix
evaluatedAt: 2026-08-26
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
# ai-skill-output-template 对「脚本bug修复+agent测试记录」场景的适用性评估

## 结论

ai-skill-output-template 对「修复+复测」半适用：解决输出规范化（造型/必填/分级/脱敏），但不覆盖测试执行与断言正确性，需搭配 Runbook 使用。

## ① 项目架构地图

| 目录/入口 | 职责 | 证据 |
| --- | --- | --- |
| linux64/plugin/hc_db_influxdb_linux.py | 修复目标：get_config_path 配置路径解析 | L107/L115 helpers；L127 or""空版本保护；L141-172 回退链 |
| linux64/plugin/hc_db_influxdb_linux_al.py | 同源变体，同步修复 | L167/175/187/... 同逻辑 |
| tmp/linux/influxdb | 交付物：runbook+模板+单测 | AGENT_RUNBOOK.md / AGENT_TEST_RECORD_TEMPLATE.md / test_get_config_path.py |

## ② 维度覆盖矩阵

| 维度 | 状态 | 证据 | 风险 |
| --- | --- | --- | --- |
| docs-structure | covered | ai-skill-output-template 提供 frontmatter 契约+四件套+分级引用，已摘入复测模板 | low |
| exec-verify | partial | 模板只约束输出形状，不校验 config_path/http_port 真值；真值需 Runbook A3/A5 断言+单测 | high（scheme 二.1（配置多源/验证能力不在模板）） |
| reusability | covered | L0 契约可跨脚本复用；替换{脚本名}/断言字段即可套到 memcached/redis/es | low |

## ③ 各 skill 详细分析

### architect-security
- 原则: 输出结构纪律
- 证据: 报告形状由 C1 renderer 强制，LLM 只写 narrative
- 风险分级: covered
- 下一步: 作为复测外壳，不套 render 主流程

## ④ 问题点汇总统计

| 风险级 | 计数 | 涉及维度 |
| --- | --- | --- |
| critical | 0 |  |
| high | 1 | exec-verify |
| medium | 0 | — |
| low | 2 | — |

覆盖状态：covered=2 partial=1 N/A=0 missing=0

## ⑤ 改进方案 — Critical/High 阻塞项详述

（无 C/H 阻塞项）

## 关键发现

L0 契约有效且可复用；render 强约束不适用修复类记录；真值校验靠 Runbook 与单测。

## 加固建议

把 L0 契约抽出作轻量复测 runbook 模板，标注 [强制]/[必填]/[选填]。

## 下一步

用本模板产出 influxdb 复测三份记录，套用到其它 DB 脚本修复。

