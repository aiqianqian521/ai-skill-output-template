// test-universal-template.cjs — 通用模板 renderer + validator 回归测试
// 用法: node tests/test-universal-template.cjs   （工作目录=包根）
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const renderer = require(path.join(ROOT, "scripts", "render.cjs"));

function sampleArchitect(){
  return {
    family: "architect",
    project: "cspm-agent",
    evaluatedAt: "2026-08-26",
    title: "通用模板回归测试",
    status: "covered",
    skillName: "architect-security",
    archMap: [{ dir: "src/agent", role: "agent 编排", evidence: "src/agent/generic_agent.py 47KB" }],
    dimensions: [
      { dim: "security", status: "missing", evidence: "config.yaml L5-16", risk: "critical", trigger: "scheme 一.1" },
      { dim: "design", status: "partial", evidence: "src/agent", risk: "high", trigger: "scheme 二.1" }
    ],
    skillAnalyses: [
      { skill: "architect-security", principle: "检查密钥管理", evidence: "config.yaml L5-16", risk: "critical", nextStep: "轮换密钥" }
    ],
    narratives: {
      summary: "发现明文密钥，security 维 critical。",
      keyFindings: "config.yaml 三组明文 DINGTALK 凭证。",
      hardening: "轮换密钥 + .gitignore + env 读取。",
      nextSteps: "24h 内轮换，按验证命令复核。"
    }
  };
}

function testRender(){
  const md = renderer.render(sampleArchitect());
  assert(md.startsWith("---\n"), "frontmatter 未在文件首");
  assert(md.includes("skill_family: architect"), "frontmatter 缺 family");
  assert(md.includes("## 结论"), "缺结论段");
  assert(md.includes("## ① 项目架构地图"), "缺①架构地图");
  assert(md.includes("## ④ 问题点汇总统计"), "缺④统计");
  assert(md.includes("## ⑤ 改进方案"), "缺⑤改进方案");
  assert(md.includes("| critical | 1 | security |"), "critical 计数错");
  assert(md.includes("| high | 1 | design |"), "high 计数错");
  assert(md.includes("covered=0"), "覆盖统计错");
  console.log("✓ render.cjs 五段结构 + 统计计算 OK");
  return md;
}

function testAllFamilies(){
  const base = (family, extra) => Object.assign({
    family, project: "p", evaluatedAt: "2026-08-26", title: "t", skillName: family + "-x",
    dimensions: [], narratives: { summary: "s" }
  }, extra || {});
  const cases = {
    architect: base("architect", { archMap: [{dir:"a",role:"r",evidence:"e"}], dimensions:[{dim:"d",status:"covered",evidence:"e",risk:"low"}] }),
    ooda:      base("ooda",      { narratives: { summary: "s", observe:"o", orient:"r", act:"a", verify:"v" } }),
    obsidian:  base("obsidian",  { links: ["n"], narratives: { summary: "s", evidence: "e", nextStep: "n" } }),
    cspm:      base("cspm",      { narratives: { summary: "s" } })
  };
  for(const name of Object.keys(cases)){
    const md = renderer.render(cases[name]);
    assert(md.startsWith("---\n"), name + " frontmatter 应置首");
    assert(md.includes("skill_family: " + name), name + " family 缺失");
  }
  console.log("✓ 四族（architect/ooda/obsidian/cspm）渲染冒烟 OK");
}

function testValidateViaCLI(md){
  const tmp = path.join(ROOT, "tests", "_tmp-validated.md");
  fs.writeFileSync(tmp, md, "utf8");
  try {
    const out = execFileSync("node", [path.join(ROOT, "scripts", "validate.mjs"), tmp], { encoding: "utf8" });
    console.log("✓ validate.mjs CLI: " + out.trim());
  } finally { fs.unlinkSync(tmp); }
}

function main(){
  const md = testRender();
  testValidateViaCLI(md);
  testAllFamilies();
  console.log("✓ 通用模板回归测试通过");
}
main();

