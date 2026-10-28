// test-e2e.cjs — 端到端完整测试：四族样例输入 -> render -> validate -> 结构断言
// 覆盖 renderer 的真实 CLI 路径（落盘），而非只渲染内存对象。
// 用法: node tests/test-e2e.cjs   （工作目录=包根）
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const NODE = process.execPath;

function runNode(args){ return execFileSync(NODE, args, { encoding: "utf8" }).trim(); }

// 各族 -> 输出内容里必须包含的锚点，验证与 L1 规范一致
const EXPECT = {
  architect: [
    "## 结论",
    "## ① 项目架构地图",
    "## ② 维度覆盖矩阵",
    "## ③ 各 skill 详细分析",
    "## ④ 问题点汇总统计",
    "## ⑤ 改进方案 — Critical/High 阻塞项详述",
    "| critical | 1 | security |",
    "| high | 1 | design |",
    "覆盖状态：covered=1 partial=2 N/A=1 missing=1"
  ],
  ooda: [
    "## 结论",
    "## Observe",
    "## Orient / 问题分级",
    "## Act",
    "## Verify",
    "skill_family: ooda"
  ],
  obsidian: [
    "## 结论",
    "## 证据 / 背景",
    "## 相关链接",
    "- [[index]]",
    "skill_family: obsidian"
  ],
  cspm: [
    "## 结论",
    "## ① 项目架构地图",
    "## ② 维度覆盖矩阵",
    "## ④ 问题点汇总统计",
    "skill_family: cspm"
  ],
  "repro_architect": [
    "## ④ 问题点汇总统计",
    "| critical | 0 |",
    "| high | 1 | design |",
    "| medium | 2 |",
    "覆盖状态：covered=3 partial=3 N/A=1 missing=0"
  ]
};

function main(){
  const outRoot = path.join(ROOT, "output", "_e2e");
  // 清理上一次产物
  fs.rmSync(outRoot, { recursive: true, force: true });

  for(const [family, needles] of Object.entries(EXPECT)){
    const inFile = path.join(ROOT, "samples", family + ".input.json");
    const outFile = path.join(outRoot, family, "report.md");
    // 1) 渲染到磁盘（使用真实 CLI）
    runNode([path.join(ROOT,"scripts","render.cjs"), inFile, "--out", outFile]);
    assert(fs.existsSync(outFile), family + " 未生成 report.md");
    const md = fs.readFileSync(outFile, "utf8");
    // 2) frontmatter 置首
    assert(md.startsWith("---\n"), family + " frontmatter 未置首");
    // 3) 结构断言
    for(const n of needles){ assert(md.includes(n), family + " 缺锚点: " + n + " | 实际输出见 " + outFile); }
    // 4) validate.mjs 通过
    const vout = runNode([path.join(ROOT,"scripts","validate.mjs"), outFile]);
    assert(vout.includes("valid"), family + " validate 未通过: " + vout);
    console.log("PASS " + family + "  (render+validate+结构断言)");
  }
  console.log("✓ 端到端完整测试：四族 + 真实数据复现（cspm_agent）共 5 例全部通过");
}
main();



