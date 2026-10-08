#!/usr/bin/env node
'use strict';
// Native lesson/repair availability in one visit. Original health, wards,
// collisions, cooldowns and mana; stationary AI isolates available content.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),walk=require('./lib/walk-grid.cjs');
const r=runtime(),{G}=r;
function cast(art,frames=40){const slot=G.getLoadout(G.state.formId).indexOf(art);assert.ok(slot>=0);
 for(let i=0;i<400&&(G.state.player.mana<G.abilityManaCost(G.abilities[art])||(G.state.player.cooldowns[art]||0)>0);i++){G.state.time+=.025;G.updatePlayer(.025);G.combat.updateProjectiles(.025);r.drain();}
 r.taps.add(['a','b','c'][slot]);
 for(let i=0;i<frames;i++){G.state.time+=.05;G.updatePlayer(.05);G.combat.updateProjectiles(.05);G.updateFx(.05);r.drain();}}
function aim(x,y){const p=G.state.player,dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
for(const road of G.EARLY_FORM_ROADS){
 G.questsDone=[];G.questCounts={};G.state.loadouts={};G.state.claimedForms=['rat','knight','wizard',road.formId];G.state.formId='nobody';G.setForm(road.formId);
 G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.ensureTown().requests=['recipes','beacon'];G.state.stars=14;
 G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.roadworks=G.makeRoadworks();G.state.formEchoes=[];
 G.state.formOutings={active:{formId:road.formId,arts:[],scenes:[]},features:[]};r.load(road.id);r.drain();let casts=0;
 for(const repair of road.repairs){walk(r,...repair.approach);const target=repair.nodes?.[0]||[repair.x,repair.y];aim(target[0]*16+8,target[1]*16+8);
  if(road.formId==='vampire')for(let i=0;i<20&&!G.roadRepairOpen(repair.id);i++){
   const e=G.state.enemies.find(e=>!e.dead&&!e.def.practice&&Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56);assert.ok(e);walk(r,Math.floor(e.x/16)-1,Math.floor(e.y/16));aim(e.x,e.y);cast('bloodBite',8);casts++;
  }else{cast(road.formId==='alchemist'?'volatileFlask':road.formId==='stormcaller'?'chainLightning':road.formId==='riftblade'?'riftRush':road.formId==='mole'?'burrowBlitz':G.forms[road.formId].basic);casts++;}
  assert.ok(G.roadRepairOpen(repair.id),repair.id+' opens through its action');}
 const form=G.forms[road.formId],p=G.state.player;
 // These two bodies teach a three-beat rhythm. Approach an untouched
 // authored crowd from its side and keep the native timing; aiming at
 // whichever single foe is closest cannot prove a wide third beat.
 if(['riftblade','mole'].includes(form.id))for(const [x,y]of form.id==='riftblade'?[[9,5],[28,6]]:[[9,5],[28,17]]){
  walk(r,x,y);aim((x+1)*16+8,y*16+8);for(let beat=0;beat<3;beat++){cast(form.basic,8);casts++;}
 }
 for(;casts<100&&G.activeFormOuting();casts++){
  const living=G.state.enemies.filter(e=>!e.dead&&!e.def.practice);assert.ok(living.length,'no respawning is needed: '+JSON.stringify({form:road.formId,counts:G.questCounts,lessons:G.questsDone,outing:G.activeFormOuting()}));
  living.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const e=living[0];
  const available=[form.basic,...form.abilities.filter(a=>a.level<=G.formLevel(form.id)).map(a=>a.id)];
  const rhythm=['riftblade','mole'].includes(form.id);
  let art=G.questsDone.includes(form.quests[0].id)&&(!rhythm||G.questsDone.includes(form.quests[1].id))?available[1]:form.basic;
  if(e.ward?.hp>0)art=available.find(id=>e.ward.types.includes(G.abilities[id].type));
  const tx=Math.floor(e.x/16),ty=Math.floor(e.y/16);
  // Bramble Scout's first lesson needs the actual distant contact. Choose
  // a safe bow perch, not melee distance, until it has been learned.
  const offset=road.formId==='ranger'&&!G.questsDone.includes(form.quests[0].id)?7:['burrowBlitz','crimsonWaltz'].includes(art)?4:1;
  const spots=[[tx-offset,ty],[tx+offset,ty],[tx,ty-offset],[tx,ty+offset]].filter(([x,y])=>G.world.isSafeSpawn(x*16+8,y*16+8)&&!G.world.blocksProjectile(x*16+8,y*16+8));
  spots.sort((a,b)=>Math.hypot(a[0]*16+8-p.x,a[1]*16+8-p.y)-Math.hypot(b[0]*16+8-p.x,b[1]*16+8-p.y));
  assert.ok(spots.length);
  if(!rhythm||art!==form.basic||Math.hypot(e.x-p.x,e.y-p.y)>27)walk(r,...spots[0]);
  aim(e.x,e.y);cast(art,rhythm&&art===form.basic?8:40);
 }
 assert.equal(G.activeFormOuting(),null,road.id+' finishes naturally in one visit');
 console.log(JSON.stringify({form:road.formId,repairs:G.state.roadworks.opened.length,casts,level:G.formLevel(form.id),defeated:G.state.enemies.filter(e=>e.dead&&!e.def.practice).length,respawns:0}));
}
