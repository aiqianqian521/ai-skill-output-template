---
skill_family: architect
skill_name: architect-security
project: cspm-agent
evaluatedAt: 2026-08-26
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
# cspm-agent 架构评估（完整样例）

## 结论

发现明文密钥，security 维 critical；design/git 两处 high。

## ① 项目架构地图

| 目录/入口 | 职责 | 证据 |
| --- | --- | --- |
| src/agent | agent 编排核心 | src/agent/generic_agent.py 47KB |
| config | 配置加载 | config.yaml L5-16 |
| aggregator | 聚合评估 | aggregator/reference/input-format.md |

## ② 维度覆盖矩阵

| dim | 状态 | 证据 | 风险 |
| --- | --- | --- | --- |
| security | missing | config.yaml L5-16 三组明文 | critical |
| design | partial | src/agent 单文件 47KB | high |
| test | partial | backtest 62 scripts | medium |
| docs | covered | README 存在且含入口 | low |
| frontend | not-applicable | 无 UI | low |

## ③ 各 skill 详细分析

### architect-security
- 原则: 密钥/暴露面/访问控制
- 证据: config.yaml L5-16
- 风险分级: critical
- 下一步: 24h 轮换密钥

### architect-git
- 原则: 变更管控/目录卫生
- 证据: .gitignore 未忽略 config.yaml
- 风险分级: high
- 下一步: config.yaml 入 .gitignore

## ④ 问题点汇总统计

| 风险级 | 计数 | 涉及维度 |
| --- | --- | --- |
| critical | 1 | security |
| high | 1 | design |
| medium | 1 | - |
| low | 2 | - |

覆盖状态：covered=1 partial=2 N/A=1 missing=1

## ⑤ 改进方案 — Critical/High 阻塞项详述

### C1
(钉钉凭证明文入库)
- 现象: config.yaml L5-16 三组明文；TESTDT 同凭证
- 根因: 无密钥管理设施
- 影响: 仓库可获取者可伪造告警 webhook
- 验证命令: Select-String config.yaml 'SECRET' 应变空

### H1
(src/agent 单文件过大)
- 现象: generic_agent.py 47KB
- 根因: 未按职责拆分
- 影响: 可维护性差
- 验证命令: wc -L generic_agent.py 低于阈值

## 关键发现

config.yaml 三组明文 DINGTALK 凭证；backtest 61 脚本爆炸。

## 加固建议

P0 轮换密钥，再改 .gitignore + env 读取。

## 下一步

P0 密钥轮换 -> P1 design 拆分 -> P2 test pytest 化。

