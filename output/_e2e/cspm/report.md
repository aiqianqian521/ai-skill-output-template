---
skill_family: cspm
skill_name: skill-sas-cspm-report
project: cspm-prod-sub
evaluatedAt: 2026-08-26
input_ref: references/input-format.md
renderer: scripts/render.cjs
status: covered
---
# CSPM 合规报告（demo）

## 结论

CIS 已覆盖，secret 维存在明文密钥需立即处理。

## ① 项目架构地图

| 目录/入口 | 职责 | 证据 |
| --- | --- | --- |
| cspm/cis | CIS 扫描 | cspm/cis_base.py |
| cspm/pci | PCI 映射 | cspm/pci_map.py |

## ② 维度覆盖矩阵

| dim | 状态 | 证据 | 风险 |
| --- | --- | --- | --- |
| cis | covered | cis 通过项 42/54 | low |
| pci | partial | pci 未覆盖网络层 | medium |
| secret | missing | 扫描发现明文 AK/SK | critical |

## ③ 各 skill 详细分析

(_none_)

## ④ 问题点汇总统计

| 风险级 | 计数 | 涉及维度 |
| --- | --- | --- |
| critical | 1 | secret |
| high | 0 | - |
| medium | 1 | - |
| low | 1 | - |

覆盖状态：covered=1 partial=1 N/A=0 missing=1

## ⑤ 改进方案 — Critical/High 阻塞项详述

(_none_)

