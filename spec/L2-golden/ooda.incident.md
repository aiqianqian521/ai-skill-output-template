# L2 金样 — ooda 家族 · 场景：故障处理（incident）

> ooda 同族第二场景：事件处置循环。与 ooda.loop（复盘）不同——incident 强调「事件上下文 + 处置时间线 + 分级收尾」，适合故障应急。
> 模板声明：`templates/ooda.incident.json`
> 渲染：`node scripts/render.cjs input.json --template ooda.incident --out report.md`

## 元信息
- project: prod-outage-0809
- skill_family: ooda-inscr
- skill_name: ooda-incident
- severity: P1
- evaluatedAt: 2026-09-01
- 结构: 五段 —— ①事件发现(Observe) / ②定位与分构(Orient) / ③干预处置(Act) / ④验证与收尾(Verify) / ⑤事件时间线

## ① 事件发现（Observe）
- 09:00 起，账务窗口每秒超时率突增到 23%，P1 告警触发。
- [直接观察] 窗口 502 占比从基线 0.1% 爬升到 18%。

## ② 定位与分构（Orient）
- [AI推断] 防火墙规则 1042 未放行新部署的 ping 端口，请求被 25ms 超时边界拦截。
- 分级：高（scheme 二.3 边界未收敛，两技能矛盾）。

## ③ 干预处置（Act）
- 添加放行规则 + 热重载防火墙，观察 3 分钟。

## ④ 验证与收尾（Verify）
- 超时率回落到 0.2%，窗口恢复正常。
- 根因记录 + 规则基线已更新，防复发。

## ⑤ 事件时间线
| 时刻 | 动作 | 负责人 |
|------|------|--------|
| 09:00 | P1 告警、初始排查 | sre-a |
| 09:07 | 定位为防火墙规则缺放行 | sre-b |
| 09:11 | 添加规则并热重载 | sre-a |
| 09:14 | 验证恢复，归档 | sre-b |

## 与 ooda.loop 的差异
| 维度 | ooda.loop（复盘） | ooda.incident（故障处理） |
|------|------------------|--------------------------|
| 定位 | 过程复盘、跨轮对照 | 单次事件处置 |
| 结构 | Observe/Orient/Act/Verify | +事件时间线 |
| frontmatter | status | + severity |
| 收尾 | summary.md 关闭 | 根因 + 防复发归档 |
