#!/usr/bin/env node
'use strict';
// Read-only registry inventory. No reward or prerequisite is granted here.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),{G}=runtime();
function itemRules(rule){if(!rule)return [];return [...(rule.type==='item'?[rule.item]:[]),...(rule.requirements||[]).flatMap(itemRules),...(rule.options||[]).flatMap(itemRules)];}
const bosses=Object.values(G.enemies).filter(e=>e.miniboss),forms=G.formOrder.map(id=>G.forms[id]);assert.equal(bosses.length,19);
const rows=bosses.map(e=>{const item=e.id==='tollkeeper'?'keeper-lantern':e.trophy,mark=G.WORLDWAKE_MARKS[item];assert.ok(G.treasureInfo[item],e.id+' needs a concrete physical gift');const unlocks=forms.filter(f=>itemRules(f.unlock).includes(item));return {id:e.id,name:e.name,maps:Object.values(G.maps).filter(m=>Object.values(m.legend||{}).some(c=>c.enemy===e.id)).map(m=>m.id),native:{hp:e.hp,ward:e.ward,speed:e.speed},actions:e.id==='tollkeeper'?['native flood refuge and outward crossing']:e.boss.patterns||['charge','blades'],gift:{item,...G.treasureInfo[item]},unlocks:unlocks.map(f=>({id:f.id,name:f.name,requirements:f.unlock,firstUsefulRole:G.FORM_ROLES[f.id],optionalRoads:(G.EARLY_FORM_ROADS||[]).filter(r=>r.formId===f.id).map(r=>r.id)})),...(mark?{worldMark:mark,outing:(G.FORM_TRAILS||[]).find(t=>t.mark===mark.id)}:{})};});
assert.equal(new Set(rows.map(r=>r.gift.item)).size,19);console.log(JSON.stringify({scope:'Registry inventory only; not native collection, a full fight or continuous campaign proof.',portfolio:G.finalExamMastery(),rows},null,2));
