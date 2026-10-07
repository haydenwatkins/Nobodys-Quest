#!/usr/bin/env node
'use strict';
// Native lesson/repair availability in one visit. Original health, wards,
// collisions, cooldowns and mana; stationary AI isolates available content.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),walk=require('./lib/walk-grid.cjs');
const r=runtime(),{G}=r;
function cast(art){const slot=G.getLoadout(G.state.formId).indexOf(art);assert.ok(slot>=0);r.taps.add(['a','b','c'][slot]);
 for(let i=0;i<40;i++){G.state.time+=.05;G.updatePlayer(.05);G.combat.updateProjectiles(.05);G.updateFx(.05);r.drain();}}
function aim(x,y){const p=G.state.player,dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
for(const road of G.EARLY_FORM_ROADS){
 G.questsDone=[];G.questCounts={};G.state.loadouts={};G.state.claimedForms=['rat','knight','wizard',road.formId];G.state.formId='nobody';G.setForm(road.formId);
 G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.ensureTown().requests=['recipes','beacon'];G.state.stars=14;
 G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.roadworks=G.makeRoadworks();G.state.formEchoes=[];
 G.state.formOutings={active:{formId:road.formId,arts:[],scenes:[]},features:[]};r.load(road.id);r.drain();let casts=0;
 for(const repair of road.repairs){walk(r,...repair.approach);const target=repair.nodes?.[0]||[repair.x,repair.y];aim(target[0]*16+8,target[1]*16+8);cast(road.formId==='alchemist'?'volatileFlask':road.formId==='stormcaller'?'chainLightning':G.forms[road.formId].basic);casts++;
  assert.ok(G.roadRepairOpen(repair.id),repair.id+' opens through its action');}
 const form=G.forms[road.formId],p=G.state.player;
 for(;casts<100&&G.activeFormOuting();casts++){
  const living=G.state.enemies.filter(e=>!e.dead&&!e.def.practice);assert.ok(living.length,'no respawning is needed');
  living.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const e=living[0];
  const available=[form.basic,...form.abilities.filter(a=>a.level<=G.formLevel(form.id)).map(a=>a.id)];
  let art=G.questsDone.includes(form.quests[0].id)?available[1]:form.basic;
  if(e.ward?.hp>0)art=available.find(id=>e.ward.types.includes(G.abilities[id].type));
  const tx=Math.floor(e.x/16),ty=Math.floor(e.y/16);
  // Bramble Scout's first lesson needs the actual distant contact. Choose
  // a safe bow perch, not melee distance, until it has been learned.
  const offset=road.formId==='ranger'&&!G.questsDone.includes(form.quests[0].id)?7:1;
  const spots=[[tx-offset,ty],[tx+offset,ty],[tx,ty-offset],[tx,ty+offset]].filter(([x,y])=>G.world.isSafeSpawn(x*16+8,y*16+8)&&!G.world.blocksProjectile(x*16+8,y*16+8));
  spots.sort((a,b)=>Math.hypot(a[0]*16+8-p.x,a[1]*16+8-p.y)-Math.hypot(b[0]*16+8-p.x,b[1]*16+8-p.y));
  assert.ok(spots.length);walk(r,...spots[0]);aim(e.x,e.y);cast(art);
 }
 assert.equal(G.activeFormOuting(),null,road.id+' finishes naturally in one visit');
 console.log(JSON.stringify({form:road.formId,repairs:G.state.roadworks.opened.length,casts,level:G.formLevel(form.id),defeated:G.state.enemies.filter(e=>e.dead&&!e.def.practice).length,respawns:0}));
}
