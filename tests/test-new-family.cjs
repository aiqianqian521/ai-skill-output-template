// test-new-family.cjs — 新增 family 模板的可扩展性回归测试
// 覆盖 render.cjs 修复：声明式注册中心新增 family（project）不再被 "unknown family" 拒绝。
// 用法: node tests/test-new-family.cjs   （工作目录=包根）
const assert = require("assert");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const renderer = require(path.join(ROOT, "scripts", "render.cjs"));

function projectInput(){
  return {
    family: "project",
    project: "loop-dev",
    evaluatedAt: "2026-09-01",
    title: "project 家族回归测试",
    status: "covered",
    skillName: "project-overview",
    archMap: [{ dir: "loop-engine/orchestrator.py", role: "CLI 组合根", evidence: "~680 行" }],
    dimensions: [
      { dim: "ci", status: "partial", evidence: "本地 run_gate L15", risk: "high", trigger: "scheme 二.5" },
      { dim: "ops", status: "partial", evidence: "runtime_exec.py sandbox 未做", risk: "medium", trigger: "scheme 三.2" }
    ],
    skillAnalyses: [
      { skill: "orchestrator", principle: "编排 OODA 7 步", evidence: "orchestrator.py 680 行", risk: "low", nextStep: "保持组合根职责" }
    ],
    blockers: [
      { id: "B1", level: "high", scheme: "scheme 二.5", title: "CI", phenomenon: "本地门禁可绕过", rootCause: "无远程 CI", impact: "无法宣称绿色", verify: "绕过 hook 仍被拒" }
    ],
    narratives: {
      summary: "project 家族回归测试：显式 --template 可渲染；对未注册 family 仍保持拒绝。",
      architecture: "全景架构：入口层 -> 编排层 OODA 7 步 -> 执行层 backtest_adapter -> 持久层。\n```mermaid\nflowchart TB\n    CLI[orchestrator] --> OODA[OODA 7 步]\n```",
      taskFlow: "设计者视角：一次任务由编排器取信号、排除已知失败、跑回测、验证、学习。\n```mermaid\nsequenceDiagram\n    L->>S: 取信号\n    L->>ST: 排除\n    L->>W: 回测\n```",
      usage: "使用者视角：运行用 --doctor 自检后 --once 跑一轮；查询用 --history 与 --status。",
      successCriteria: "用户定义成功：“什么算成功”由输入里的 success_criteria/verification 定义（比如 1+1=2 是必然结果一次命中；复杂目标按判定式可行性 loop 近跟）。",
      keyFindings: "关键发现：新 family 只需注册 JSON 模板即可渲染，不加代码分支。",
      hardening: "加固建议：未注册 family 仍拒绝以保证结构不漂移。",
      nextSteps: "下一步：把 project 家族推广到更多公开项目的完整介绍文档。"
    }
  };
}

function testNewFamilyRender(){
  const md = renderer.render(projectInput(), { template: "project.overview" });
  assert(md.startsWith("---\n"), "frontmatter 应置首");
  assert(md.includes("skill_family: project"), "project family 缺失");
  assert(md.includes("## 全景架构图"), "缺架构图段");
  assert(md.includes("```mermaid"), "缺 mermaid 图");
  assert(md.includes("## ⑧ 使用者视角"), "缺使用者视角段");
  console.log("✓ 新 family(project) 经 --template 显式渲染 OK（回归保护）");
  return md;
}

function testUnknownFamilyRejected(){
  let threw = null;
  try {
    renderer.render({ family: "nosuch", project: "p", evaluatedAt: "2026-08-26", narratives: { summary: "s" } });
  } catch (e) { threw = e.message; }
  assert(threw && /unknown family/.test(threw), "未注册 family 应被拒绝，实际: " + threw);
  console.log("✓ 未注册 family 正确拒绝（unknown family）");
}

function main(){
  const md = testNewFamilyRender();
  const tmp = path.join(ROOT, "tests", "_tmp-project.md");
  require("fs").writeFileSync(tmp, md, "utf8");
  try {
    const out = execFileSync("node", [path.join(ROOT, "scripts", "validate.mjs"), tmp, "--template", "project.overview"], { encoding: "utf8" });
    const first = out.trim().split("\n")[0];
    console.log("✓ validate.mjs(project.overview): " + first);
  } finally { require("fs").unlinkSync(tmp); }
  testUnknownFamilyRejected();
  console.log("✓ 新增家族可扩展性回归测试通过");
}
main();
