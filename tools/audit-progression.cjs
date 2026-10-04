#!/usr/bin/env node
'use strict';
// Read actual shipped registries; no saved player state or generated assets.
// --json emits all unlock rules/lessons. An optional prior JSON form snapshot
// compares quotas, without needing to read thousands of sprite source lines.
const fs=require('node:fs'),runtime=require('./lib/classic-runtime.cjs');
const {G}=runtime(),args=process.argv.slice(2),baselineFile=args.find(a=>a!=='--json');
const forms=G.formOrder.map(id=>G.forms[id]).filter(f=>f&&!f.invalid);
const baseline=baselineFile?JSON.parse(fs.readFileSync(baselineFile,'utf8')):null;
const dependencies=rule=>!rule?[]:rule.type==='challenge'?(rule.requirements||[]).flatMap(dependencies):
 rule.type==='any'?(rule.options||[]).flatMap(dependencies):['formLevel','level'].includes(rule.type)?[rule.form]:[];
const graph=new Map(forms.map(f=>[f.id,[...new Set(dependencies(f.unlock))]]));
for(const f of forms){
 function portfolioParents(rule){if(!rule)return [];if(rule.type==='challenge')return (rule.requirements||[]).flatMap(portfolioParents);
  if(rule.type==='previousFormsLevel')return G.formOrder.slice(0,G.formOrder.indexOf(f.id));
  if(rule.type==='allFormsLevel'||rule.type==='finalExamMastery')return G.formOrder.filter(id=>id!==f.id);return [];}
 graph.get(f.id).push(...portfolioParents(f.unlock));
}
const seen=new Set(),active=new Set(),cycles=[];
function visit(id){if(active.has(id)){cycles.push(id);return;}if(seen.has(id))return;active.add(id);for(const parent of graph.get(id)||[])visit(parent);active.delete(id);seen.add(id);}
for(const f of forms)visit(f.id);
const lessons=forms.flatMap(f=>f.quests.map(q=>({form:f.id,...q}))),exam=G.finalExamMastery();
const quotaChanges=baseline?forms.flatMap(f=>{const old=baseline.find(b=>b.id===f.id);return f.quests.flatMap((q,i)=>old&&old.quests[i].count!==q.count?[{id:q.id,before:old.quests[i].count,after:q.count}]:[]);}):[];
const report={
 summary:{forms:forms.length,lessons:lessons.length,invalidForms:G.formOrder.length-forms.length,dependencyCycles:cycles,
  finalBreadth:exam.breadthGoal,finalSpecialists:exam.specialistGoal,
  // Each level is one completed lesson; level-five specialists also count
  // toward breadth. Marks, trophies, access and combat time are additional.
  minimumPortfolioCompletions:exam.breadthGoal*2+exam.specialistGoal*2,
  largestGroup:Math.max(...lessons.map(q=>q.event==='multiHit'?q.match?.hits?.gte||1:1)),
  ...(baseline?{changedQuotas:quotaChanges.length}:{}),workshopErrors:G.workshopErrors},
 roads:Object.entries(G.maps).flatMap(([mapId,map])=>Object.values(map.legend||{}).filter(cell=>cell.portal).map(cell=>({from:mapId,to:cell.portal.map,stars:cell.stars||0,...(cell.mark?{mark:cell.mark}:{}),...(cell.allWorldMarks?{allWorldMarks:true}:{}),...(cell.masteryPortfolio?{masteryPortfolio:true}:{})}))),
 wards:Object.values(G.enemies).filter(e=>e.ward&&!e.boss).map(e=>({id:e.id,types:e.ward.types,hp:e.hp})),
 forms:forms.map(f=>({id:f.id,name:f.name,unlock:f.unlock,quests:f.quests})),quotaChanges,
};
if(args.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
 console.log(JSON.stringify(report.summary,null,2));
 console.log('FORM\tFIRST LESSON\tALL LESSON QUOTAS');
 for(const f of forms)console.log(`${f.id}\t${f.quests[0].text}\t${f.quests.map(q=>q.count).join(', ')}`);
 console.log('CAMPAIGN ROADS');
 for(const road of report.roads.filter(r=>r.from==='overworld'&&['sunstepPrairie','shattercoast','godTrial'].includes(r.to)))console.log(JSON.stringify(road));
}
if(cycles.length||G.workshopErrors.length||report.summary.invalidForms)process.exitCode=1;
