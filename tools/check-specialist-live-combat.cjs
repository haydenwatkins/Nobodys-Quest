#!/usr/bin/env node
'use strict';
// A bounded live-AI smoke run, not a continuous campaign playtest. Earned
// checkpoint; original foes, health, wards, mana, cooldowns and movement.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs');
for(const formId of ['stormcaller','dragon']){
  const r=runtime(),{G}=r;
  Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
  G.state.claimedForms=['rat','knight','wizard','ranger','frog','alchemist',formId];G.state.stars=18;
  G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];
  G.setForm(formId);const road=G.EARLY_FORM_ROADS.find(r=>r.formId===formId);r.load(road.id);r.drain();
  const p=G.state.player,initial=(G.playerMaxHearts()-p.damageTaken);
  // Exercise the native buffered aim path, as touch drag/right-stick input
  // does, so walking direction cannot silently turn an aimed attack.
  G.input.takeAim=()=>({...G.input.aim,dragged:true});
  for(let i=0;i<240;i++){r.step(.05);r.drain();assert.equal(G.deliveryCandidate()?.id,'road-'+formId,'the real idle AI leaves the entrance conversation safe');}
  assert.equal((G.playerMaxHearts()-p.damageTaken),initial);
  function face(x,y){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;p.dir=G.input.aim={x:dx/d,y:dy/d};}
  function advance(){r.step(.025);r.drain();assert.ok(!G.state.knockout&&(G.playerMaxHearts()-p.damageTaken)>0,'the authored road remains survivable: '+JSON.stringify({formId,x:p.x,y:p.y,health:(G.playerMaxHearts()-p.damageTaken),near:G.state.enemies.filter(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-p.x,e.y-p.y)<100).map(e=>[e.id,e.x,e.y,e.hp]),counts:G.questCounts}));}
  function defend(){
    const e=G.state.enemies.filter(e=>!e.dead&&!e.def.practice).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    if(!e)return;
    const distance=Math.hypot(e.x-p.x,e.y-p.y);
    if(e.ward?.hp>0){
      const loadout=G.getLoadout(formId),slot=loadout.findIndex(id=>id&&e.ward.types.includes(G.abilities[id].type));
      if(slot>=0&&distance<30){face(e.x,e.y);r.taps.add(['a','b','c'][slot]);}
      return;
    }
    if(distance<(formId==='dragon'?45:110)){face(e.x,e.y);r.taps.add('a');}
    if(distance<70&&p.mana>=4){face(e.x,e.y);r.taps.add('b');}
  }
  function walkTo(x,y){
    const start=[Math.floor(p.x/16),Math.floor(p.y/16)],queue=[start],parent=new Map([[start.join(','),null]]);
    for(let i=0;i<queue.length&&!parent.has(x+','+y);i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const [px,py]=queue[i],nx=px+dx,ny=py+dy,key=nx+','+ny;
      if(parent.has(key)||![[0,0],[-3,0],[3,0],[0,-3],[0,3]].every(([ox,oy])=>G.world.isSafeSpawn(nx*16+8+ox,ny*16+8+oy)))continue;
      parent.set(key,[px,py]);queue.push([nx,ny]);
    }
    assert.ok(parent.has(x+','+y));const points=[];let at=[x,y];while(at){points.unshift(at);at=parent.get(at.join(','));}
    for(const [tx,ty]of points){
      for(let i=0;i<300&&Math.hypot(tx*16+8-p.x,ty*16+8-p.y)>2;i++){
        const dx=tx*16+8-p.x,dy=ty*16+8-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};defend();advance();
      }
      assert.ok(Math.hypot(tx*16+8-p.x,ty*16+8-p.y)<=2,'native movement reaches its waypoint');
    }
    G.input.vec={x:0,y:0};
  }
  for(const repair of road.repairs){
    walkTo(...repair.approach);
    const [x,y]=repair.nodes[0];
    for(let i=0;i<300&&!G.roadRepairOpen(repair.id);i++){
      defend();face(x*16+8,y*16+8);
      if(formId==='dragon'||p.mana>=4)r.taps.add(formId==='dragon'?'a':'b');advance();
    }
    assert.ok(G.roadRepairOpen(repair.id),'live native action completes '+repair.id);
  }
  walkTo(road.at[0],road.at[1]+1);
  // A pursuer can follow the player home. The request correctly waits
  // while fighting is nearby; finish that encounter before reporting.
  for(let i=0;i<600&&!G.deliveryCandidate();i++){defend();advance();}
  assert.equal(G.deliveryCandidate()?.id,'road-'+formId,JSON.stringify({map:G.state.mapId,x:p.x,y:p.y,npcs:G.state.npcs.map(n=>[n.id,n.x,n.y]),near:G.state.enemies.filter(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-p.x,e.y-p.y)<90).map(e=>[e.id,e.x,e.y,e.hp]),ready:G.roadworkStep(road)}));
  console.log(JSON.stringify({form:formId,quietArrivalSeconds:12,repairs:2,startingHealth:initial,endingHealth:(G.playerMaxHearts()-p.damageTaken),defeated:G.state.enemies.filter(e=>e.dead&&!e.def.practice).length,respawns:0,ai:'original'}));
}
