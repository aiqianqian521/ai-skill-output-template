# 自评报告（P9 视角）— 通用输出模板

> 按 P9 的执行纪律对本模板做一轮结构化自检（方法：结论先行 / 事实与判断分开 / 取舍显性化 / 验证标准）。
> 用途：记录「评估 → 修改 → 完整构建」闭环，供后续回归与维护。

## 一、评估结论
模板可交付：四族（architect / ooda / obsidian / cspm）共享 L0 契约，L1 家族差异化，L2 金样可回归；renderer 代码强制结构、validator 把关 frontmatter 与结论锚点，回归测试全绿。
主要取舍：用「三层 + 一份 renderer」替代「每家族各自一套模板」，换取结构统一与维护成本下降，代价是家族特有微格式需在 L1 文档里声明边界。

## 二、检查清单（事实）
| 项 | 结果 |
|----|------|
| SKILL.md 可被触发（name/description） | 通过 |
| L0 frontmatter 字段齐全 | 通过（validator 强制 7 项） |
| renderer 支持四 family | 通过（architect/ooda/obsidian/cspm 均渲染） |
| 统计块由 render 计算（非 LLM） | 通过（覆盖状态/分级计数来自 dimensions） |
| validator 可发现缺少 frontmatter / 结论锚点 | 通过（测试覆盖） |
| 金样回归基线存在 | 通过（L2-golden/ 四份） |
| 样例输入 + 渲染产物可复现 | 通过（samples + output/） |

## 三、发现并修复的问题
1. renderer 早期把 title 放在 frontmatter 之前 → 改为 frontmatter 置首，符合 L0 契约与 markdown 惯例。
2. validator 草案的四件套检查过严（要求正文里出现「证据/风险分级」等字面），与 renderer 实际输出不一致 → 收敛为「结论锚点 + 正文非空」。
3. 金样与 L1 文档存在错别字 / 措辞小瑕疵 → 统一术语、修正编号与错别字。
4. 回归测试仅覆盖 architect → 补充四族冒烟，确认「通用」成立。

## 四、残余风险 / 后续
- 各家族金样目前是「骨架示例」，与真实输出的逐字对照仍需在首个落地实例上核验。
- ooda / obsidian 家族更依赖宿主约定（state.md、vault 双链），renderer 只保证顶层级结构，细粒度由 L1 文档约束。
- 尚未接入真实 skill；建议第一个接入对象选 architect 家族，跑通「构造 input → render → validate → 落盘」全链路。




## 五、真实数据复现（2026-08-26）
用真实项目喂模板走完整链路验证：
- 输入：`samples/repro_architect.input.json`，证据全部来自 cspm_agent Intake 实测
  - security：`.env` 已在 `.gitignore` 且未被 git 跟踪；`.env.example` 留空被跟踪；`config/agents.yaml` 无 secret 明文；Dockerfile 注释显式禁止硬编码 `ARMS_LICENSE_KEY` → covered/good（与 runtime01201 反面样例形成对照，证明模板能识别规范做法）
  - design：`baseline_statistics_aggregator.py` 1424 行 / `generic_agent.py` 974 行 / `pop_loader.py` 953 行 → high（scheme 二.1，god-file）
  - ops：compose 无 healthcheck/resource limits → medium
  - test：round-19..32 多轮测试、入口较散 → medium
  - docs：README 环境变量参考表完备 → covered
- 结果：渲染→校验→统计计算全部通过，产物见 `output/repro/cspm_agent/2026-08-26/report.md`。
- 结论：模板既能准确标注「明文密钥入库」类危险项目，也能识别「密钥管理合规」项目（.env 未入库），区分度有效。

## 六、真实接入 loop-dev（2026-09-01）— 扩展 project 家族

用 loop-dev（CLI 自进化回测编排框架）喂模板，验证模板的通用性与可扩展性：

- **接入场景**：完整项目介绍（不是"问题清单"），需要"架构图前置 + 双视角(设计者/使用者) + 详细流程图"。
  已有四族模板都不完全贴切 → 新增 `project.overview` 模板。
- **发现并修复的 renderer 缺陷**：`render.cjs` 硬编码 `KNOWN_FAMILIES`，新增 family 会被 `unknown family` 拒绝，
  与"新增技能=新增 JSON 零改代码"承诺冲突 → 校验改为"有注册模板即放行（id/family/fallback_family）"。
- **新增资产**：
  - `templates/project.overview.json`（架构图前置 + 双视角章节序）
  - `spec/L1-project.md`（家族规范：章节序 / mermaid 放置 / 双视角书面要求）
  - `spec/L2-golden/project-overview.md`（金样：2026-09-01 loop-dev 报告为基准）
  - `samples/project.overview.input.json`（loop-dev 全量样例，231 行报告 / 4 张 mermaid）
  - `tests/test-new-family.cjs`（回归：新增 family 不被拒 + 未注册仍拒绝）
- **验证**：render → validate 通过；报告含 13 章节、4 张 mermaid（架构图 / 运行流程 / 自主 loop 时序 / 查询历史）。
  全量回归：e2e 5 例 + validate-gates 9 + universal 冒烟 + 新家族回归，全部通过。
- 输出凸出“两点设计初衷”（知识库串联）：本轮把 loop 知识库（PM框架-接入规范 / loop-verification-design / 项目定位总览）里“什么算成功”的设计聚合为 `successCriteria` narrative 目录节，并强调“编排器不是计算器”的分工初衷，报告包含“成功判定机制”专篇 + 5 张 mermaid。
对 skill 的启示**：文档输出可模块化场景化——每一族模板 = 一个"对外可交付文档类型"；
  project 族补充了"让别人完整了解项目"这一类，后续可沉淀更多公开项目场景（见下一步）。

## 七、后续（待办）
- 用更多公开项目验证/完善模板（按用户意向：大厂项目文档输出规范，选若干公开项目补充模板/样例）。
- 可选：为「同步到项目仓库/知识库」补充导出约定；为特定家 spragma 增加真值表渲染。
