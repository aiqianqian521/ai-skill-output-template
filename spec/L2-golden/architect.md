# L2 金样 — architect 家族（五段结构）

> 金样实例：2026-08-26 cspm-agent 单项目报告。结构由 renderer 强制，LLM 只写 narrative。此金样用于架构家族回归对照。

## 元信息
- project: cspm-agent · family: architect · evaluatedAt: 2026-08-26 · tier: L2
- 输入契约：references/input-format.md
- renderer: `node scripts/render.cjs input.json --out output/architect/cspm-agent/2026-08-26/report.md`

## ① 项目架构地图
| 目录/入口 | 职责一句话 | 关键文件（行级） |
|-----------|-----------|----------------|
| src/agent | agent 核心编排 | src/agent/generic_agent.py 47KB |
| config | 配置加载（含明文密钥） | config.yaml L5-16 |

## ② 维度覆盖矩阵
| 维度 | 状态 | 证据 | 风险 |
|------|------|------|------|
| security | missing | config.yaml L5-16 三组明文件 | critical（scheme 一.1） |
| design | partial | src/agent 分层在；但单文件47KB | high（scheme 二.1） |

## ③ 各 skill 详细分析
### architect-security
- 原则: 检查密钥管理/暴露面/访问控制
- 证据: config.yaml L5-16 三组 DINGTALK TOKEN+SECRET 明文
- 风险分级: critical（scheme 一.1 明文密钥入库）
- 下一步: 24h 内轮换密钥，config.yaml 移入 .gitignore

## ④ 问题点汇总统计（cspm 风格）
| 风险级 | 计数 | 涉及维度 |
|--------|------|---------|
| critical | 1 | security |
| high | 2 | design, git |
| medium | 3 | ops, docs, test |
| low | 0 | — |

覆盖状态：covered=2 partial=11 N/A=2 missing=0

## ⑤ 改进方案 — Critical/High 阻塞项详述
### C1（critical · scheme 一.1）钉钉凭证明文入库
- 现象: config.yaml L5-16 三组明文；DINGTALK 与 TESTDT 同凭证；.gitignore 未忽略 config.yaml
- 根因: 无密钥管理意识；测试/生产凭证未隔离
- 影响: 仓库可获取者可伪造告警 webhook；测试生产一次泄露波及全环境
- 修复顺序: 轮换密钥 → .gitignore+example → env 读取 → 测试生产隔离
- 验证命令: Select-String -Path config.yaml -Pattern "TOKEN|SECRET" 应空

## 结论叙述
（LLM 填 summary_narrative：一句话给出整体判断 + 证据 + 假设）
