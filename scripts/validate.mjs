
// validate.mjs - declaration-driven output validation (L0 contract + content-quality gates)
// usage: node scripts/validate.mjs <file.md> [--template <id>]   exit 0 = pass
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TPL_DIR = path.join(ROOT, "templates");
const FORBIDDEN = path.join(ROOT, "references", "forbidden-words.md");

function stripBom(s){ return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function listTemplates(){
  if(!fs.existsSync(TPL_DIR)) return [];
  return fs.readdirSync(TPL_DIR).filter(f => f.endsWith(".json")).map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(TPL_DIR, f), "utf8")); }
    catch { return null; }
  }).filter(Boolean);
}

function resolveTemplate(fm, explicit){
  const all = listTemplates();
  if(explicit) return all.find(t => t.id === explicit) || null;
  const fam = (fm.skill_family || "").trim();
  if(!fam) return all.find(t=>t.default) || all[0] || null;
  let m = all.find(t => t.family === fam) || all.find(t => t.fallback_family === fam);
  if(m){ const def = all.find(tt=> (tt.family===fam || tt.fallback_family===fam) && tt.default); return def || m; }
  return all.find(t=>t.default) || all[0] || null;
}

function effectiveLen(s){
  if(!s) return 0;
  return String(s).replace(/[#*`_>|[\]()\-]/g, "").replace(/\s+/g, " ").trim().length;
}

function looksLikeEvidence(s){
  return /L\d+([-,]\d+)*/i.test(s) || /:\s*\d+/.test(s)
      || /\d+(\.\d+)?\s*(KB|MB|B)\b/i.test(s)
      || /\.(py|go|js|ts|java|c|cpp|rb|json|ya?ml|md|toml|sh)\b/i.test(s);
}

function looksLikeTrigger(s){
  return /scheme/i.test(s) || /\u00a7/.test(s)
      || /[\u4e00-\u4e5d]\.[\u4e00-\u4e5d\d]/.test(s)
      || /^\s*\d{1,2}[\u3002\uff09)]/.test(s);
}

function loadForbidden(){
  try { return fs.readFileSync(FORBIDDEN, "utf8"); } catch { return ""; }
}

function segOf(s, heading){
  const lines = s.split("\n");
  let started = false, seg = "";
  for(const ln of lines){
    if(/^## /.test(ln)){
      if(started) break;
      if(ln.trim() === "## " + heading) started = true;
      continue;
    }
    if(started) seg += ln + "\n";
  }
  return seg;
}

export function validateFile(p, opts = {}){
  const s = stripBom(fs.readFileSync(p, "utf8"));
  const errs = [], warns = [];
  if(!s.startsWith("---\n")) errs.push("frontmatter missing (must start with ---, no BOM)");
  let fm = {};
  const m = s.match(/^---\n([\s\S]*?)\n---\n/);
  if(m){
    for(const line of m[1].split("\n")){
      const mm = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
      if(mm) fm[mm[1]] = mm[2].trim();
    }
  } else { errs.push("frontmatter not closed"); }

  const tpl = resolveTemplate(fm, opts.template);
  if(!tpl){ errs.push("no template matched (templates/ empty or bad --template)"); }
  else {
    const req = tpl.frontmatter_required || [];
    if(!req.length) errs.push("template missing frontmatter_required");
    for(const k of req) if(!(k in fm)) errs.push("frontmatter missing: " + k);
  }

  if(!/^## (\d+\. )?\u7ed3\u8bba/m.test(s)) errs.push("missing \u7ed3\u8bba section");

  // narrative sections declared in the template must carry real content
  const narrSecs = ((tpl && tpl.sections) || []).filter(sc => sc.kind === "narrative");
  const minLen = (tpl && tpl.narratives_min_len) || 10;
  for(const ns of narrSecs){
    const seg = segOf(s, ns.title);
    if(effectiveLen(seg) < minLen) errs.push("narrative lacks content["+ns.field+"/"+ns.title+"] <"+minLen+")");
  }

  const v = (tpl && tpl.validation) || {};
  const body = s;
  const evRegex = /^\s*[-*]\s*(?:\u8bc1\u636e|evidence|\u6821\u9a8c|verify)\s*[:：]\s*(.+)$/i;
  const rkRegex = /^\s*[-*]\s*(?:\u98ce\u9669|risk|\u98ce\u9669\u5206\u7ea7)\s*[:：]\s*(.+)$/i;
  for(const ln of body.split("\n")){
    let mm = ln.match(evRegex);
    if(mm && v.require_evidence_on_finding && !looksLikeEvidence(mm[1])){
      warns.push("evidence lacks file:line scope: " + String(mm[1]).slice(0,60));
    }
    mm = ln.match(rkRegex);
    if(mm && v.require_trigger_ref && !looksLikeTrigger(mm[1])){
      warns.push("risk grade lacks scheme/trigger ref: " + String(mm[1]).slice(0,60));
    }
  }

  if(v.other_saturation_max){
    const re = /\b(other|design_flaw|missing_test|god_file|hardcoded_secret|monkey_patch|missing_coverage|dup_code|config_drift|doc_gap|compliance_gap|observability_gap|missing_validation|performance_issue)\b/g;
    const counts = {};
    let mm;
    while((mm = re.exec(body))) counts[mm[1]] = (counts[mm[1]]||0)+1;
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    if(total>0){
      const ratio = (counts["other"]||0)/total;
      if(ratio > v.other_saturation_max) warns.push("other-saturation "+(100*ratio).toFixed(0)+"% > threshold "+(100*v.other_saturation_max).toFixed(0)+"%");
    }
  }

  if(v.forbidden_words){
    const fb = loadForbidden();
    const bad = (fb.match(/^[-*]\s*(.+)$/gm)||[]).map(x=>x.replace(/^[-*]\s+/,"")).filter(w=>w && !w.includes("\u4f8b\u5916"));
    for(const w of bad) if(body.includes(w)) warns.push("forbidden word: "+w);
  }

  const bodyIdx = s.indexOf("\n---\n") + 5;
  if(s.slice(bodyIdx).trim().length < 10) errs.push("body too short/empty");
  return { errs, warns, template: tpl ? tpl.id : null };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if(isMain){
  if(process.argv[2]){
    const file = process.argv[2];
    const ti = process.argv.indexOf("--template");
    const tid = (ti!==-1 && process.argv[ti+1]) ? process.argv[ti+1] : undefined;
    const r = validateFile(file, { template: tid });
    for(const e of r.errs) console.error("ERR " + e);
    for(const w of r.warns) console.log("WARN " + w);
    if(r.errs.length){ console.error("INVALID: " + file); process.exit(1); }
    console.log("valid["+(r.template||"?")+"]: " + file);
  } else {
    console.error("usage: node scripts/validate.mjs <file.md> [--template <id>]");
    process.exit(2);
  }
}
