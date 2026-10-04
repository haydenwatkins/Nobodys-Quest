#!/usr/bin/env node
'use strict';
// Controlled encounter check: original spawns, health, wards, mana, recovery,
// feet collision and native inputs. Enemy AI is held still to test whether
// one visit supplies the lessons; this does not measure fight difficulty.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),walk=require('../tests/helpers/walk-road.cjs');
const r=runtime(),{G}=r;
function routeTo(x,y){
 const start=[Math.floor(G.state.player.x/16),Math.floor(G.state.player.y/16)],queue=[start],parents=new Map([[start.join(','),null]]);
 for(let i=0;i<queue.length&&!parents.has(x+','+y);i++){const [px,py]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const nx=px+dx,ny=py+dy,key=nx+','+ny;if(parents.has(key)||!G.world.isSafeSpawn(nx*16+8,ny*16+8))continue;parents.set(key,[px,py]);queue.push([nx,ny]);}}
 assert.ok(parents.has(x+','+y),'there is a walked approach to the encounter');const path=[];let point=[x,y];
 while(point){path.unshift(point);point=parents.get(point.join(','));}walk(r,path);
}
for(const trail of G.FORM_TRAILS){
 G.questsDone=[];G.questCounts={};G.state.loadouts={};G.state.claimedForms=['rat','knight','wizard',trail.formId];
 G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.ensureTown().requests=['recipes','beacon'];
 G.state.stars=40;G.state.items=['trophy-mire-pearl'];G.state.worldwake.marks=[trail.mark];G.state.formId='nobody';
 G.state.formOutings={active:{formId:trail.formId,arts:[],scenes:[]},features:[]};G.setForm(trail.formId);r.load(trail.id);r.drain();
 const form=G.forms[trail.formId],p=G.state.player;let casts=0;
 for(;casts<120&&G.activeFormOuting();casts++){
  const arts=[form.basic,...form.abilities.filter(a=>a.level<=G.formLevel(form.id)).map(a=>a.id)];
  const living=G.state.enemies.filter(e=>!e.dead);assert.ok(living.length,'the outing must finish without respawning foes');
  living.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const enemy=living[0];
  let art=arts[0];
  if(enemy.ward?.hp>0)art=arts.find(id=>enemy.ward.types.includes(G.abilities[id].type));
  else if(G.questsDone.includes(form.quests[0].id))art=arts[1];
  assert.ok(art,'the body has an immediate answer to this encounter');
  const tile=[Math.floor(enemy.x/16),Math.floor(enemy.y/16)];
  const approaches=[[tile[0]-1,tile[1]],[tile[0]+1,tile[1]],[tile[0],tile[1]-1],[tile[0],tile[1]+1]]
   .filter(([x,y])=>G.world.isSafeSpawn(x*16+8,y*16+8));
  approaches.sort((a,b)=>Math.hypot(a[0]*16+8-p.x,a[1]*16+8-p.y)-Math.hypot(b[0]*16+8-p.x,b[1]*16+8-p.y));
  routeTo(...approaches[0]);const dx=enemy.x-p.x,dy=enemy.y-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};
  const slot=G.getLoadout(form.id).indexOf(art);assert.ok(slot>=0,'the art is naturally available in the new body');
  r.taps.add(['a','b','c'][slot]);
  for(let i=0;i<40;i++){G.state.time+=.05;G.updatePlayer(.05);G.combat.updateProjectiles(.05);G.updateFx(.05);r.drain();}
 }
 assert.equal(G.activeFormOuting(),null,trail.id+' supplies two lessons, two arts and two distinct encounters in one visit');
 console.log(JSON.stringify({form:trail.formId,casts,level:G.formLevel(form.id),defeated:G.state.enemies.filter(e=>e.dead).length,respawns:0}));
}
