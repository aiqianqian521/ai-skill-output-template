# L2 金样 — cspm 家族（安全合规报告）

> cspm 家族产出多标准合规报告，结构由服务端 render 强制，LLM 只填 narrative 四段。金样展示报告骨架。

## frontmatter 字段
```
skill_family: cspm
skill_name: skill-sas-cspm-report
project: <resource>
evaluatedAt: "2026-07-02T141528"
```

## 报告骨架
```
## 统计汇总（renderer 播算）
覆盖状态：covered=2 partial=11 N/A=2 missing=0   # 数据来自实测
风险分级：critical 1 / high 2 / medium 3 / low 0
## 各标准/子项结论（covered/N-A 均带证据或复检触发）
- CIS: 每项 covered/partial/missing + 行级证据
- ...
## narrative（LLM 只写这四段）
- p1_narrative         # 开场：整体判断一句话
- summary_narrative    # 结论，含证据/假设
- key_findings         # 关键发现清单
- hardening_suggestion # 加固建议，有验证门禁
```

## 强约束
- 明文密钥发现即 critical，证据脱敏展示
- templates/ 旧模板已标注弃用，一律走服务端 render
- 多时间戳 output/ 保留历史金样

## 落盘
- output/cspm/{报告}_{YYYYMMDD_HHMMSS}.md


