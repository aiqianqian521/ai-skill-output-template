# L1 — obsidian 家族输出模板（分）

> 本文件在 L0 契约之上，定义 obsidian 知识库类 skill（obsidian-capture / obsidian-index / obsidian-query）的输出结构。obsidian 家族输出的是**写进 vault 的原子笔记 + 双链连接 + 索引**，核心价值是可被二次检索、可维护。

## 一、家族定位

obsidian 家族做「知识管理」。它产出的是笔记文件，通过 frontmatter 元数据 + 双链（wikilink）让知识形成可导航网络；它是唯一一个把「结构」交给 Obsidian 生态（属性/properties、双链、图谱）的家族。

## 二、核心结构（L0 之上叠 Obsidian 层）

| 元素 | 规则 |
|------|------|
| frontmatter | 必须含 L0 交集字段 + `tags` / `aliases` / `project` / `created` |
| 内容结构 | 先结论/最新状态，再证据/背景，再下一步；与 L0 四件套一致 |
| 双链 | 关联笔记用 `[[wikilink]]`，禁止裸路径硬编码跳转 |
| 命名 | 语义化文件名；时间相关用 `YYYY-MM-DD` 前缀或 frontmatter 记录 |

## 三、frontmatter 示例
```yaml
---
skill_family: obsidian
skill_name: obsidian-capture
project: p3-vault-audit
tags: [vault-audit, obsidian, index]
aliases: [审阅]
created: "2026-08-07"
---
```

## 三、落盘
- 目标路径由调用方 `--path` 指定（vault 目录），renderer 不硬编码。
- 索引笔记写 `_index.md` 或由 obsidian-index skill 维护。

## 四、金样
对照 `spec/L2-golden/obsidian.md`。


