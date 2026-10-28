
// test-validate-gates.mjs - regression for strong content-quality gates in validate.mjs
// usage: node tests/test-validate-gates.mjs   (workdir = package root)
import { validateFile } from "../scripts/validate.mjs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const require = createRequire(import.meta.url);
const renderer = require("../scripts/render.cjs");
const { render } = renderer;

let pass = 0, fail = 0;
function check(name, cond){ if(cond){ pass++; console.log("  PASS "+name); } else { fail++; console.log("  FAIL "+name); } }
const tmp = path.join(os.tmpdir(), "vgate-"+Date.now()+".md");
function mine(md, tid){ fs.writeFileSync(tmp, md, "utf8"); return validateFile(tmp, { template: tid }); }

function validInput(){ return {
  family:"architect", skillName:"architect-security", project:"cspm-agent", evaluatedAt:"2026-09-01",
  title:"gate test", status:"covered",
  archMap:[{dir:"src/agent", role:"agent", evidence:"src/agent/generic_agent.py 47KB"}],
  dimensions:[{dim:"security", status:"missing", evidence:"config.yaml L5-16", risk:"critical", trigger:"scheme 1.1"}],
  skillAnalyses:[{skill:"architect-security", principle:"key", evidence:"config.yaml L5-16", risk:"critical (scheme 1.1)", nextStep:"rotate"}],
  findings:[{id:"C1", level:"critical", title:"secret"}],
  blockers:[{id:"C1", level:"critical", title:"secret", phenomenon:"config.yaml L5-16", rootCause:"none", impact:"leak", verify:"Select-String"}],
  narratives:{ summary:"A plaintext credential is in config.yaml L5-16; security is critical.",
               keyFindings:"Three DINGTALK tokens at config.yaml L5-16.",
               hardening:"Rotate keys, gitignore config, read from env.",
               nextSteps:"Rotate within 24h, verify with Select-String." }
};}

console.log("\n[T1] good report passes (no errs)");
{ const md = render(validInput()); const r = mine(md); check("errs empty", r.errs.length===0); check("template matched", r.template==="architect.single-report"); }

console.log("\n[T2] bad A: empty narratives -> blocked");
{ const b = validInput(); b.narratives = {summary:"", keyFindings:"", hardening:"", nextSteps:""}; const r = mine(render(b)); check("narrative errs>0", r.errs.some(e=>/narrative/.test(e))); }

console.log("\n[T3] bad B: missing frontmatter field -> blocked");
{ const raw = "---\nskill_family: architect\nskill_name: x\n---\n# t\n\n## 结论\n\none two three four five six seven eight nine ten.\n"; const r = mine(raw); check("frontmatter errs present", r.errs.some(e=>/frontmatter/.test(e))); }

console.log("\n[T4] multi-scene: explicit --template ooda.incident");
{
  const inc = { family:"ooda", skillName:"ooda-incident", project:"p", evaluatedAt:"2026-09-01", title:"t", status:"covered", severity:"P1",
    timeline:[{at:"09:00", action:"alert", owner:"sre"}],
    narratives:{ summary:"A real summary about an incident event and its handling.",
                 observe:"Error rate spiked to 23% at 09:00 across the payment window.",
                 orient:"Firewall rule 1042 is missing the allow entry for the new ping port.",
                 act:"Added the allow rule and reloaded the firewall config live.",
                 verify:"Error rate dropped back to 0.2% within three minutes of reload." } };
  const md = render(inc, { template:"ooda.incident" });
  const r = mine(md, "ooda.incident");
  check("template ooda.incident", r.template==="ooda.incident");
  check("has timeline heading", md.includes("事件时间线"));
  check("errs empty", r.errs.length===0);
}

console.log("\n[T5] default: ooda no explicit -> ooda.loop (has Observe)");
{
  const o = { family:"ooda", skillName:"ooda", project:"p", evaluatedAt:"2026-09-01", title:"t", status:"covered",
    narratives:{ summary:"A summary for the ooda loop review process outcome." } };
  const md = render(o);
  check("template ooda.loop", mine(md).template==="ooda.loop");
  check("has Observe", md.includes("## Observe"));
}

fs.unlinkSync(tmp);
console.log("\n----------------------------------------");
console.log("validate-gates: "+pass+" passed, "+fail+" failed");
process.exit(fail ? 1 : 0);
