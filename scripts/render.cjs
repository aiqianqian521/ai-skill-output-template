
// render.cjs - declaration-driven template renderer
// Structure is CODE-forced; LLM only fills narratives. Templates live in templates/<id>.json.
// usage:
//   node scripts/render.cjs input.json                       # default = match template by family
//   node scripts/render.cjs input.json --template <id>       # explicit template
//   node scripts/render.cjs input.json --template <id> --out output/<family>/<project>/<date>/report.md
const path = require("path");
const fs = require("fs");

function stripBom(s){ return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }
const ROOT = path.resolve(__dirname, "..");
const TPL_DIR = path.join(ROOT, "templates");

const KNOWN_FAMILIES = ["architect","ooda","obsidian","cspm"];

function listTemplates(){
  if(!fs.existsSync(TPL_DIR)) return [];
  return fs.readdirSync(TPL_DIR).filter(f=>f.endsWith(".json")).map(f=>{
    try{ return JSON.parse(fs.readFileSync(path.join(TPL_DIR,f),"utf8")); }catch{ return null; }
  }).filter(Boolean);
}
function loadTemplate(idOrFamily){
  const all = listTemplates();
  if(!all.length) return null;
  if(idOrFamily){
    const byId = all.find(t=>t.id===idOrFamily);
    if(byId) return byId;
    const famMatch = all.filter(t=>t.family===idOrFamily || t.fallback_family===idOrFamily);
    if(famMatch.length){ const def = famMatch.find(t=>t.default); return def || famMatch[0]; }
    return null;
  }
  // no explicit template: prefer the family's declared default scene, else first
  const fam = (all[0] && all[0].family) || "";
  const anyDefault = all.find(t=>t.default);
  return anyDefault || all[0];
}

function mdTable(cols, rows){
  let out = "| " + cols.map(c=>c.h).join(" | ") + " |\n";
  out += "| " + cols.map(()=>"---").join(" | ") + " |\n";
  for(const r of rows) out += "| " + cols.map(c=> r[c.f]==null ? "" : String(r[c.f])).join(" | ") + " |\n";
  return out;
}

function computeStats(input){
  const counts = { critical:0, high:0, medium:0, low:0 };
  const byLevel = { critical:[""], high:[""], medium:[""], low:[""] };
  const covCounts = { covered:0, partial:0, "not-applicable":0, missing:0 };
  for(const d of (input.dimensions||[])){
    const lv = d.risk || "";
    if(lv in counts){ counts[lv]++; if(!byLevel[lv][0]) byLevel[lv][0]=d.dim; else byLevel[lv].push(d.dim);}
    const st = d.status||""; if(st in covCounts) covCounts[st]++;
  }
  return { counts, byLevel, covCounts };
}

function renderSection(section, input, stat){
  const k = section.kind;
  if(k === "narrative"){
    const v = input.narratives ? input.narratives[section.field] : "";
    if(v) return "## " + section.title + "\n\n" + v + "\n\n";
    return "## " + section.title + "\n\n" + "(_empty_)\n\n";
  }
  if(k === "table"){
    const rows = input[section.rows] || [];
    if(!rows.length) return "## " + section.title + "\n\n(_empty_)\n\n";
    return "## " + section.title + "\n\n" + mdTable(section.cols, rows) + "\n";
  }
  if(k === "subs"){
    const rows = input[section.rows] || [];
    let out = "## " + section.title + "\n\n";
    if(!rows.length){ return out + "(_none_)\n\n"; }
    for(const r of rows){
      out += "### " + (r.id||r.skill||RowLabel(r)) + "\n";
      if(r.title) out += "(" + r.title + ")\n";
      for(const f of section.fields){ let _v = r[f.f]||"_missing_"; if(f.f2 && r[f.f2]) _v = String(_v) + " (" + String(r[f.f2]) + ")"; out += "- " + f.label + ": " + _v + "\n"; }
      out += "\n";
    }
    return out;
  }
  if(k === "stats"){
    const c = stat.counts, bl = stat.byLevel;
    const dimsOf = (lv)=> (bl[lv]||[]).filter(Boolean).join(",") || "-";
    let out = "## " + section.title + "\n\n";
    out += mdTable([{h:"\u98ce\u9669\u7ea7",f:"risk"},{h:"\u8ba1\u6570",f:"count"},{h:"\u6d89\u53ca\u7ef4\u5ea6",f:"dims"}], [
      {risk:"critical",count:c.critical,dims:dimsOf("critical")},
      {risk:"high",count:c.high,dims:dimsOf("high")},
      {risk:"medium",count:c.medium,dims:"-"},
      {risk:"low",count:c.low,dims:"-"}]);
    out += "\n";
    const co = stat.covCounts;
    out += "\u8986\u76d6\u72b6\u6001\uff1acovered="+co.covered+" partial="+co.partial+" N/A="+co["not-applicable"]+" missing="+co.missing+"\n\n";
    return out;
  }
  if(k === "list"){
    const rows = input[section.rows] || [];
    if(!rows.length) return "## " + section.title + "\n\n(_none_)\n\n";
    const line = section.wiki ? (x=>"- [["+x+"]]") : (x=>"- "+x);
    return "## " + section.title + "\n\n" + rows.map(line).join("\n") + "\n\n";
  }
  return "";
}
function RowLabel(r){ if(r.dir) return r.dir; if(r.skill) return r.skill; return (r.id||"item"); }

function frontmatter(input, tpl){
  // template-driven frontmatter: emit each declared field from input (or default map)
  const def = {
    skill_family: input.family,
    skill_name: input.skillName || "?",
    project: input.project,
    evaluatedAt: input.evaluatedAt,
    input_ref: "references/input-format.md",
    renderer: "scripts/render.cjs",
    status: input.status || "covered",
    tags: Array.isArray(input.tags) ? input.tags.join(", ") : (input.tags || ""),
    aliases: Array.isArray(input.aliases) ? input.aliases.join(", ") : (input.aliases || "")
  };
  const emit = (k) => {
    if(def[k] !== undefined && def[k] !== "") return def[k];
    if(input[k] !== undefined && input[k] !== null){
      const v = input[k];
      return Array.isArray(v) ? v.join(", ") : String(v);
    }
    return "?";
  };
  const keys = (tpl && tpl.frontmatter_required) || Object.keys(def);
  let out = "---\n";
  for(const k of keys){ out += k + ": " + emit(k) + "\n"; }
  return out + "---\n";
}

// built-in fallback render for families that predate template registration
function renderLegacyByFamily(input){
  // reuse previous behaviour for exact back-compat
  const F = input.family;
  const n = input.narratives||{};
  let out = "";
  if(n.summary) out += "## 结论\n\n" + n.summary + "\n\n";
  if(F==="architect"||F==="cspm"){
    if((input.archMap||[]).length){
      out += "## "+"\u2460 \u9879\u76ee\u67b6\u6784\u5730\u56fe\n\n"+mdTable([{h:"\u76ee\u5f55/\u5165\u53e3",f:"dir"},{h:"\u804c\u8d23",f:"role"},{h:"\u8bc1\u636e",f:"evidence"}], input.archMap)+"\n";
    }
    out += "## "+"\u2461 \u7ef4\u5ea6\u8986\u76d6\u77e9\u9635\n\n"+mdTable([{h:"\u7ef4\u5ea6",f:"dim"},{h:"\u72b6\u6001",f:"status"},{h:"\u8bc1\u636e",f:"evidence"},{h:"\u98ce\u9669",f:"risk"}], input.dimensions)+"\n";
    out += "## "+"\u2462 \u5404 skill \u8be6\u7ec6\u5206\u6790\n\n";
    const sa = input.skillAnalyses||[];
    if(sa.length){ for(const s of sa){ const rk = (s.risk||"") + (s.scheme ? " ("+s.scheme+")" : ""); out += "### "+(s.skill||"")+"\n"+"- \u539f\u5219: "+(s.principle||"")+"\n"+"- \u8bc1\u636e: "+(s.evidence||"")+"\n"+"- \u98ce\u9669\u5206\u7ea7: "+rk+"\n"+"- \u4e0b\u4e00\u6b65: "+(s.nextStep||"")+"\n\n"; } }
    else out += "(_none_)\n\n";
    const st = computeStats(input);
    out += "## "+"\u2463 \u95ee\u9898\u70b9\u6c47\u603b\u7edf\u8ba1\n\n"+mdTable([{h:"\u98ce\u9669\u7ea7",f:"risk"},{h:"\u8ba1\u6570",f:"count"},{h:"\u6d89\u53ca\u7ef4\u5ea6",f:"dims"}],
      [["critical",st.counts.critical,String(st.byLevel.critical.join(","))],["high",st.counts.high,String(st.byLevel.high.join(","))],["medium",st.counts.medium,"-"],["low",st.counts.low,"-"]] )+"\n";
    out += "covered="+st.covCounts.covered+" partial="+st.covCounts.partial+" N/A="+st.covCounts["not-applicable"]+" missing="+st.covCounts.missing+"\n\n";
    const bl = input.blockers||[];
    out += "## "+"\u2464 \u6539\u8fdb\u65b9\u6848 \u2014 Critical/High \u963b\u585e\u9879\u8be6\u8ff0\n\n";
    if(bl.length){ for(const b of bl){ out += "### "+b.id+"\n"+"- \u73b0\u8c61: "+(b.phenomenon||"")+"\n"+"- \u6839\u56e0: "+(b.rootCause||"")+"\n"+"- \u5f71\u54cd: "+(b.impact||"")+"\n"+"- \u9a8c\u8bc1\u547d\u4ee4: "+(b.verify||"")+"\n\n"; } }
    else out += "(_none_)\n\n";
  }
  else if(F==="ooda"){
    out += "## Observe\n\n"+(n.observe||"")+"\n\n";
    out += "## Orient / "+"\u95ee\u9898\u5206\u7ea7\n\n"+(n.orient||"")+"\n\n";
    out += "## Act\n\n"+(n.act||"")+"\n\n";
    out += "## Verify\n\n"+(n.verify||"")+"\n\n";
  }
  else if(F==="obsidian"){
    out += "## "+"\u8bc1\u636e / \u80cc\u666f\n\n"+(n.evidence||"")+"\n\n";
    out += "## "+"\u76f8\u5173\u94fe\u63a5\n\n"+((input.links||[]).map(l=>"- [["+l+"]]").join("\n")||"")+"\n\n";
  }
  if(n.keyFindings) out += "## "+"\u5173\u952e\u53d1\u73b0\n\n"+n.keyFindings+"\n\n";
  if(n.hardening) out += "## "+"\u52a0\u56fa\u5efa\u8bae\n\n"+n.hardening+"\n\n";
  if(n.nextSteps) out += "## "+"\u4e0b\u4e00\u6b65\n\n"+n.nextSteps+"\n\n";
  return out;
}

function render(input, options = {}){
  if(!input || typeof input !== "object") throw new Error("input must be an object");
  if(!input.family) throw new Error("missing family");
  if(!input.project) throw new Error("missing project");
  if(!input.evaluatedAt) throw new Error("missing evaluatedAt");

  let body;
  const explicitTemplate = options.template;
  const tpl = explicitTemplate ? loadTemplate(explicitTemplate) : loadTemplate(input.family);
  // Declarative registries may add new families; accept any family that has a
  // registered template (matched by id, family, or fallback_family). Legacy
  // built-in families remain covered by the built-in default match.
  if(!KNOWN_FAMILIES.includes(input.family) && !tpl){
    throw new Error("unknown family: " + input.family + " (no template registered)");
  }
  const n = input.narratives || {};
  let head = "";
  if(n.summary) head += "## "+"\u7ed3\u8bba"+"\n\n"+n.summary+"\n\n";   // L0 C2: 结论总是第一段
  if(tpl && tpl.sections && tpl.sections.length){
    const st = computeStats(input);
    const secs = tpl.sections.filter(s => !(s.kind==="narrative" && s.field==="summary"));
    body = secs.map(s=>renderSection(s, input, st)).join("");
  } else {
    body = renderLegacyByFamily(input);
  }
  return frontmatter(input, tpl) + "# " + (input.title||input.project) + "\n\n" + head + body;
}

module.exports = { render, renderBody: renderLegacyByFamily, frontmatter, stripBom, loadTemplate, listTemplates };
if(require.main === module){
  const args = process.argv.slice(2);
  const arg = args[0];
  if(!arg || arg.startsWith("--")){ console.error("usage: node scripts/render.cjs input.json [--template <id>] [--out file.md]"); process.exit(2); }
  let input;
  try { input = JSON.parse(stripBom(fs.readFileSync(arg,"utf8"))); }
  catch(e){ console.error("cannot read/parse input: "+e.message); process.exit(2); }
  const ti = args.indexOf("--template");
  const tpl = (ti!==-1 && args[ti+1]) ? args[ti+1] : undefined;
  let md;
  try { md = render(input, { template: tpl }); }
  catch(e){ console.error("render error: "+e.message); process.exit(3); }
  const oi = args.indexOf("--out");
  if(oi!==-1 && args[oi+1]){
    fs.mkdirSync(path.dirname(args[oi+1]), {recursive:true});
    fs.writeFileSync(args[oi+1], md, "utf8");
    console.log("rendered -> "+args[oi+1]);
  } else { process.stdout.write(md); }
}
