---
skill_family: architect
skill_name: architect-security
project: cspm_agent
evaluatedAt: 2026-08-26
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
# cspm_agent 真实复现评估（Intake 实测）

## 结论

cspm_agent 在密钥管理上规范（.env 未入库、无硬编码），主要技术债是 3 处 god-file（design high）与测试入口分散（test medium）。

## ① 项目架构地图

| 目录/入口 | 职责 | 证据 |
| --- | --- | --- |
| config | Agent 配置定义 | config/agents.yaml 670 行(已跟踪,无 secret 明文) |
| src/agent | Agent 编排 | generic_agent.py 974 行 / agent_team_manager.py 771 行 |
| src/tool | 工具实现(阿里云POP/本地/知识库) | pop_loader.py 953 行 / local/*.py |
| skills | Skill 定义库 | 9 个 skill 目录 |
| test | 多轮测试 | round-19..32 + run_tests.py |

## ② 维度覆盖矩阵

| dim | 状态 | 证据 | 风险 |
| --- | --- | --- | --- |
| security | covered | .env 已在 .gitignore 且未被 git 跟踪；.env.example 留空已跟踪；agents.yaml 无 secret 明文；Dockerfile 注释显式禁止硬编码 ARMS_LICENSE_KEY | low |
| design | partial | src 分层良好(agent/models/core/tool/util)；但 3 处 god-file 超 800 行 | high |
| compliance | covered | 密钥依赖运行期 env 注入，未硬编码密钥 | low |
| ops | partial | Dockerfile/compose 存在；compose 无 healthcheck/resource limits | medium |
| docs | covered | README 含完整环境变量参考表与项目结构 | low |
| test | partial | round-19..32 多轮测试 + run_tests.py/run_full_test.py；入口较散 | medium |
| frontend | not-applicable | 无前端 UI | low |

## ③ 各 skill 详细分析

### architect-security
- 原则: 密钥管理/暴露面/访问控制
- 证据: .env 未入库、env.example 留空、无硬编码密钥
- 风险分级: covered
- 下一步: 维持 .gitignore 纪律即可

### architect-git
- 原则: 变更管控/目录卫生
- 证据: .env 未被 git 跟踪；gitignore 含 .env
- 风险分级: low
- 下一步: 保持

### architect-design
- 原则: 模块边界/god-file 控制
- 证据: 3 处 god-file>800 行
- 风险分级: high
- 下一步: 拆分 aggregator/generic_agent/pop_loader

## ④ 问题点汇总统计

| 风险级 | 计数 | 涉及维度 |
| --- | --- | --- |
| critical | 0 | - |
| high | 1 | design |
| medium | 2 | - |
| low | 4 | - |

覆盖状态：covered=3 partial=3 N/A=1 missing=0

## ⑤ 改进方案 — Critical/High 阻塞项详述

### H1
(三处 god-file 超 800 行)
- 现象: baseline_statistics_aggregator.py 1424 / generic_agent.py 974 / pop_loader.py 953
- 根因: 长方法/职责聚合未拆分
- 影响: 可维护性与可测性下降
- 验证命令: 重新统计 src 下 >800 行文件数应为 0

## 关键发现

3 处 god-file 超 800 行；.env 合规未入库；compose 缺 healthcheck；测试多轮但入口分散。

## 加固建议

P1：先拆分 aggregator(1424)，再 generic_agent(974)；P2：compose 补 healthcheck 与 resource limits。

## 下一步

以 baseline_statistics_aggregator.py 为拆分试点，验证 src 下无 >800 行文件。

