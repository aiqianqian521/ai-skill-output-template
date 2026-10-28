---
skill_family: architect
skill_name: architect-security
project: cspm_agent
evaluatedAt: 2026-08-31T14:00:00Z
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
# architecture-eval-cspm_agent

## 结论

swarm review found 7 findings (critical=1, high=2). Blocked by: SEC-04.

## ① 项目架构地图

| 目录/入口 | 职责 | 证据 |
| --- | --- | --- |
| ./ | (pending Intake map) | app.py |
| test | (pending Intake map) | test/ |

## ② 维度覆盖矩阵

| dim | 状态 | 证据 | 风险 |
| --- | --- | --- | --- |
| test | partial | app.py, task_service.py, Dockerfile | medium |
| data | covered | config_env.py | medium |
| design | covered | app.py, task_service.py | high |
| security | covered | app.py, config_env.py | critical |
| ops | covered | Dockerfile, docker-compose.yml | medium |

## ③ 各 skill 详细分析

### Bacon(test)
- 原则: swarm dimension: test
- 证据: T1: test/ directory only has 12 test files while src/ has 190 files; no coverage config found
- 风险分级: medium
- 下一步: Add pytest + coverage config, target core module coverage >=70%

### Archimedes(data)
- 原则: swarm dimension: data
- 证据: D1: config_env.py:198 int(val) without try/except; invalid value causes ValueError at startup
- 风险分级: medium
- 下一步: Wrap int() with try/except, return None on invalid value and log warning

### Halley(design)
- 原则: swarm dimension: design
- 证据: DES1: app.py 602 lines: monkey patch, HTTP server, AgentRun server, tool loading, config printing; too many responsibilities || DES2: task_service.py:151-404 has 5 nearly identical _maybe_prefetch_* methods differing only in task_name/parsed type
- 风险分级: high
- 下一步: Split: app.py keeps entry only, monkey patch -> patches/, HTTP server -> server/, tool loading -> bootstrap/; Extract generic prefetch template method, each specific method only passes parser and task name

### SecurityAgent(security)
- 原则: swarm dimension: security
- 证据: SEC-04: app.py:342 ali_uid=1960721413485912 hardcoded in source, not from env var || SEC-02: app.py:20-160 runtime replacement of urllib.parse.quote and agentrun model_adapter.wrap_model breaks library consistency
- 风险分级: critical
- 下一步: Read from ALIBABA_CLOUD_ALI_UID env var, raise ConfigurationError if missing; Replace monkey patch with explicit wrapper class or upstream PR for dynamic headers

### OpsAgent(ops)
- 原则: swarm dimension: ops
- 证据: O1: Dockerfile:86-88 ENTRYPOINT commented out (AgentRun platform bug fix in progress), relies on external orchestration for start command
- 风险分级: medium
- 下一步: Track AgentRun platform bug fix, restore ENTRYPOINT after fix; temporarily specify command in docker-compose.yml

## ④ 问题点汇总统计

| 风险级 | 计数 | 涉及维度 |
| --- | --- | --- |
| critical | 1 | security |
| high | 1 | design |
| medium | 3 | - |
| low | 0 | - |

覆盖状态：covered=4 partial=1 N/A=0 missing=0

## ⑤ 改进方案 — Critical/High 阻塞项详述

### DES1
(god_file)
- 现象: app.py 602 lines: monkey patch, HTTP server, AgentRun server, tool loading, config printing; too many responsibilities
- 根因: Halley finding
- 影响: see risk scheme
- 验证命令: python -m py_compile app.py && dir src/server src/patches src/bootstrap

### SEC-04
(hardcoded_secret)
- 现象: app.py:342 ali_uid=1960721413485912 hardcoded in source, not from env var
- 根因: SecurityAgent finding
- 影响: see risk scheme
- 验证命令: grep -n '1960721413485912' app.py && echo FAIL || echo PASS

### SEC-02
(design_flaw)
- 现象: app.py:20-160 runtime replacement of urllib.parse.quote and agentrun model_adapter.wrap_model breaks library consistency
- 根因: SecurityAgent finding
- 影响: see risk scheme
- 验证命令: python -c "import app; assert hasattr(app, '_apply_dynamic_headers_patch') == False"

## 关键发现

- T1 [medium] missing_test @ test/ directory only has 12 test files w
- D1 [medium] missing_validation @ config_env.py:198 int(val) without try/e
- DES1 [high] god_file @ app.py 602 lines: monkey patch, HTTP ser
- DES2 [medium] design_flaw @ task_service.py:151-404 has 5 nearly ide
- SEC-04 [critical] hardcoded_secret @ app.py:342 ali_uid=1960721413485912 hard
- SEC-02 [high] design_flaw @ app.py:20-160 runtime replacement of url

## 加固建议

Prioritize closing: SEC-04 -> Read from ALIBABA_CLOUD_ALI_UID env var, raise ConfigurationError if missing; DES1 -> Split: app.py keeps entry only, monkey patch -> patches/, HTTP server -> server/, tool loading -> bootstrap/; SEC-02 -> Replace monkey patch with explicit wrapper class or upstream PR for dynamic headers

## 下一步

- DES1 Split: app.py keeps entry only, monkey patch -> patches/, HTTP server -> server/, tool loading -> bootstrap/
- SEC-04 Read from ALIBABA_CLOUD_ALI_UID env var, raise ConfigurationError if missing
- SEC-02 Replace monkey patch with explicit wrapper class or upstream PR for dynamic headers

