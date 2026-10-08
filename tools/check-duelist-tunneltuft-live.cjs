#!/usr/bin/env node
'use strict';
// Two bounded newly-owned-form checkpoints. Original AI, health, wards,
// input, recovery and collisions; no enemy replacement or free lessons.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs');
let seed=Number(process.argv[2]||901);Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const formId of ['riftblade','mole']){
 const r=runtime(),{G}=r,s=G.state,p=s.player;
 Object.assign(s.opening,{started:true,complete:true,bell:true,version:2});s.delivery.complete=true;
 s.claimedForms=['rat','knight','wizard',formId];s.stars=20;s.items=['trophy-heartwood-crown','trophy-mire-pearl'];
 G.ensureTown().requests=['recipes','beacon'];G.setForm(formId);s.formOutings={active:{formId,arts:[],scenes:[]},features:[]};
 const road=G.EARLY_FORM_ROADS.find(t=>t.formId===formId);r.load(road.id);r.drain();let knockouts=0,kills=0;
 G.events.on('kill',()=>kills++);
 G.events.on('ko',()=>{knockouts++;assert.ok(knockouts<=2,'the bounded route does not enter a retry loop');});
 G.input.takeAim=()=>({...G.input.aim,dragged:true});
 function step(){const before=knockouts;r.step(.025);r.drain();assert.equal(s.mapId,road.id,'combat cannot accidentally leave the road');return before===knockouts;}
 function face(x,y){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;p.dir=G.input.aim={x:dx/d,y:dy/d};return d;}
 function fight(walking=false){
  const foes=s.enemies.filter(e=>!e.dead&&!e.def.practice).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  const e=foes[0];if(!e)return;const d=face(e.x,e.y);
  if(d<32)r.taps.add('a');
  if(!walking&&G.questsDone.includes(G.forms[formId].quests[0].id)&&p.mana>=3&&!p.cooldowns[G.getLoadout(formId)[1]]&&d>32&&d<85)r.taps.add('b');
 }
 function walkTo(x,y){
  const start=[Math.floor(p.x/16),Math.floor(p.y/16)],queue=[start],parent=new Map([[start.join(','),null]]);
  for(let i=0;i<queue.length&&!parent.has(x+','+y);i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const [px,py]=queue[i],nx=px+dx,ny=py+dy,key=nx+','+ny;
   if(parent.has(key)||![[0,0],[-3,0],[3,0],[0,-3],[0,3]].every(([ox,oy])=>G.world.isSafeSpawn(nx*16+8+ox,ny*16+8+oy)))continue;
   parent.set(key,[px,py]);queue.push([nx,ny]);
  }
  assert.ok(parent.has(x+','+y),'a feet-safe route exists');const path=[];let at=[x,y];while(at){path.unshift(at);at=parent.get(at.join(','));}
  for(const [tx,ty]of path){let n=0;while(Math.hypot(tx*16+8-p.x,ty*16+8-p.y)>2&&n++<600){
   fight(true);const dx=tx*16+8-p.x,dy=ty*16+8-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};if(!step())return walkTo(x,y);
  }assert.ok(n<600,'native movement reaches the waypoint');}G.input.vec={x:0,y:0};
 }
 const health=G.playerMaxHearts()-p.damageTaken;for(let i=0;i<480;i++)step();assert.equal(G.playerMaxHearts()-p.damageTaken,health,'twelve seconds of genuine quiet at entry');
 G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(offer);r.drain();offer.onAccept();
 for(const repair of road.repairs){
  walkTo(...repair.approach);let n=0;
  while(!G.roadRepairOpen(repair.id)&&n++<1200){
   if(p.mana>=3&&!p.cooldowns[G.getLoadout(formId)[1]]&&!p.dashing){face(repair.x*16+8,repair.y*16+8);r.taps.add('b');}
   else fight(true);step();
  }assert.ok(G.roadRepairOpen(repair.id),'the native passive restores '+repair.id);
 }
 // Native pursuit brings each real crowd into reach. First the flowing
 // basic, then aimed dashes: optional combo lessons are not a gate.
 const clearings=formId==='riftblade'?[[9,5],[28,6],[25,18],[11,16]]:[[9,5],[28,17],[13,16],[25,7]];
 for(const [x,y]of clearings){walkTo(x,y);
  for(let i=0;i<1600&&G.activeFormOuting();i++){
   fight();const e=s.enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
   if(!e)break;const d=Math.hypot(e.x-p.x,e.y-p.y),approach=d>65?1:0;
   G.input.vec={x:p.dir.x*approach,y:p.dir.y*approach};step();
  }if(!G.activeFormOuting())break;
 }
 assert.equal(G.activeFormOuting(),null,'native outing completes without respawning: '+JSON.stringify({formId,counts:G.questCounts,living:s.enemies.filter(e=>!e.dead).map(e=>[e.id,e.hp]),knockouts}));
 walkTo(31,4);r.taps.add('interact');step();walkTo(road.start[0]-2,road.start[1]-2);walkTo(road.at[0],road.at[1]+1);
 for(let i=0;i<1200&&!G.deliveryCandidate();i++){fight(true);G.input.vec={x:0,y:0};step();}
 assert.equal(G.deliveryCandidate()?.id,'road-'+formId);G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes('road-'+formId));
 G.saveGame();assert.equal(G.loadSaveData().roadworks.opened.length,2);
 console.log(JSON.stringify({form:formId,seconds:Math.round(s.time),repairs:2,level:G.formLevel(formId),lessons:G.questsDone.filter(id=>G.forms[formId].quests.some(q=>q.id===id)),defeated:kills,knockouts,respawns:0,returned:true,ai:'original'}));
}
