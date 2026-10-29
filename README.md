# ai-skill-output-template — 通用 AI Skill 输出模板

统一的 AI skill 输出结构条约：让任何会产出「报告 / 评估 / 结论」的 AI skill 拥有**稳定、可校验、可回归**的输出。适用于 architect-skills、ooda、obsidian、cspm，以及 `E:\lvfs_git\cpsm_git\cspm_agent` 中自建的任何 skill。

## 核心主张
> **输出质量瓶颈不在模型写得多认真，而在结构是否被代码强制、分级是否可判定、证据是否可复核。**

与 architect-skills 五段结构的关系：
- 本包把「五段结构」抽象成 L0/L1/L2 三层通用骨架，把结构固化到具体报告。
- 不再为每个 family 各自维护一套模板，而是「L0 契约 + L1 家族 + L2 金样」三份描述。

## 目录
```
ai-skill-output-template/
├── SKILL.md              # skill 触发与接入引导
├── README.md             # 本文件（总览）
├── spec/
│   ├── L0-common.md      # 总：元结构 + 四件套 + 三级口径 + 禁止编造
│   ├── L1-architect.md   # 分：architect 五段报告
│   ├── L1-ooda.md        # 分：ooda 循环过程产物
│   ├── L1-obsidian.md    # 分：obsidian 知识库笔记
│   ├── L1-cspm.md        # 分：cspm 安全合规报告
│   └── L2-golden/        # 详：每家族金样（供回归）
│       ├── architect.md
│       ├── ooda.md
│       ├── obsidian.md
│       └── cspm.md
├── references/
│   ├── grading-scheme.md # 风险分级触发条件
│   ├── input-format.md   # 输入 JSON schema
│   └── forbidden-words.md# 禁止造词/脱敏/确定性
├── scripts/
│   ├── render.cjs        # 结构强制 renderer（LLM 只写 narrative）
│   └── validate.mjs      # 输出合规校验（frontmatter + 四件套）
└── tests/
    └── test-universal-template.cjs
```

## 使用
1. 定 family（architect / ooda / obsidian / cspm）。
2. 按 `spec/L0-common.md` + 对应 `spec/L1-<family>.md` 构造输入 JSON（见 `references/input-format.md`）。
3. 渲染：`node scripts/render.cjs input.json --out output/<family>/<project>/<date>/report.md`
4. 校验：`node scripts/validate.mjs 报告.md`
5. 回归：`node tests/test-universal-template.cjs`

## 设计来源
- architect-skills `output/golden/INDEX.md`（五段结构 + 金样回归）
- architect-skills `reference/risk-grading-scheme.md`、`cross-project-input-format.md`
- cspm `skill-sas-cspm-report`（服务端 render 强制，LLM 只写 narrative 四段）
- ooda 循环产物 + state.md 跨轮连续




## 测试
- `node tests/test-universal-template.cjs` — 单元回归：renderer 五段/统计计算 + validator CLI 校验 + 四族渲染冒烟。
- `node tests/test-e2e.cjs` — 端到端完整测试：渲染 `samples/*.input.json`（四族 + `repro_architect` 用 cspm_agent 真实证据复现）到磁盘，逐个过 `validate.mjs` 并做结构锚点断言（frontmatter 置首、四件套、五段/循环/双链等家族专属章节）。产物落 `output/_e2e/`（自动清理）。



---

## 多模板可插拔框架（v2）

**核心变化**：不再用 `render.cjs` 内置 `if-family` 硬编码。改为「模板注册中心 + 声明驱动」：
- 每个模板一个 `templates/<family>.<scene>.json`，描述段落结构 / frontmatter / narrative 校验 / 证据与分级门禁 / 金样。
- **新增一个技能或场景 = 新增一个 JSON 文件，零改代码**。
- renderer 与 validator 都按声明驱动；未指定模板时按 `family` 自动匹配，无匹配用内置 legacy 兜底。

```bash
# 渲染（按模板）
node scripts/render.cjs input.json --template architect.single-report --out output/architect/p/2026-09-01/report.md
# 校验（按模板，会做强约束：四件套/证据/分级引用/other饱和/禁词）
node scripts/validate.mjs output/architect/p/2026-09-01/report.md --template architect.single-report
```

内置模板：`architect.single-report`、`cspm.report`、`ooda.loop`、`ooda.incident`（同族第二场景）、`obsidian.note`。
给不同服务套用不同模板，见 `templates/README.md`；同族多场景各建一个 `<family>.<scene>.json` 即可。

> 关键收益：同族多场景可分开成模板（如 ooda 复盘 / 故障处理）；各技能输出结构不再写死在代码里，人人都能按声明加模板。

## 测试（含强校验门禁回归）
- `node tests/test-universal-template.cjs`  — 渲染结构 + 统计计算冒烟
- `node tests/test-validate-gates.mjs`       — 强校验门禁回归（好报告通过 / 空 narrative 拦截 / 缺 frontmatter 拦截 / 多场景模板匹配 / 默认场景匹配）
- `node tests/test-e2e.cjs`                  — 端到端：四族 + 真实数据落盘渲染 + validate，共 5 例

> 加入新的输出模板后，请同时补充一条 validate-gates 断言，防止模板声明被改坏。

## 配套项目（生态互链）

本仓是这套 agent skill 生态的「输出结构合约」：其他 skill 仓按本仓声明的结构产出报告，编排引擎按同一结构消费。

| 仓库 | 是什么 | 与本仓的关系 |
|---|---|---|
| [aiqianqian521/sloth-loop](https://github.com/aiqianqian521/sloth-loop) | 零 LLM 的任务编排引擎（身体） | 把本仓作为能力层挂载（`skills/ai-skill-output-template` 子模块），按模板校验产出 |
| [aiqianqian521/ooda_skill](https://github.com/aiqianqian521/ooda_skill) | OODA 执行循环纪律 | 使用方：复盘类报告按本仓模板渲染 |
| [aiqianqian521/architect-skills](https://github.com/aiqianqian521/architect-skills) | 19 个架构评估 skill | 使用方：评估报告按本仓模板渲染 |
| [aiqianqian521/obsidian-skills](https://github.com/aiqianqian521/obsidian-skills) | Obsidian 知识库 skill 组 | 使用方：知识库产物按本仓模板渲染 |

> 上面四个仓库都反向链接回本仓；`sloth-loop` 以 submodule 方式挂载本仓，可按需 pin 版本。
