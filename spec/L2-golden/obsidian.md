# L2 金样 — obsidian 家族（vault 笔记）

> obsidian 家族产出写进 vault 的原子化笔记，用 frontmatter + 双链组织关系。此金样供 capture/index/query 类 skill 参照。

## frontmatter 金样
```yaml
---
skill_family: obsidian
skill_name: obsidian-capture
project: p3-vault-audit
tags: [audit, vault, index]
aliases: [记档]
created: "2026-08-13"
---
# <原子主题名>
## 结论（最新状态放最前）
- 一句话判断 + [事实/推断/假设]标签 + 行级来源
## 证据 / 背景
- ...
## 下一步
- 有负责/可执行/验证门禁
## 相关链接
- [[index]]
```

## 双链规则
- 关联笔记用 [[wikilink]]，禁止裸路径
- 索引笔记归 _index.md 或由 obsidian-index skill 维护

## 落盘
- 目的路径由 --path 传入（vault 目录），renderer 不硬编码

