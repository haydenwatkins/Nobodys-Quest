#!/usr/bin/env node
'use strict';
// Independent native action/phase/floor fixtures, not whole fights. Portfolio
// and initial poses are supplied; actual warnings and projectile collision run.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),r=runtime(),{G}=r;
Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.claimedForms=G.formOrder.slice();G.questsDone.push(...G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id)));G.setForm('nobody');
const roster=Object.values(G.enemies).filter(e=>e.miniboss),results=[],failures=[];assert.equal(roster.length,19);
let observe=null;const update=G.updateEnemies;G.updateEnemies=dt=>{const arr=G.state.projectiles,push=arr.push,added=[];arr.push=function(...shots){added.push(...shots);return push.apply(this,shots);};try{update(dt);}finally{arr.push=push;}if(observe)for(const q of added)if(q.owner===observe.owner)observe.shots.push({x:q.x,y:q.y,blocked:G.world.blocksProjectile(q.x,q.y-4,q.x,q.y-4,q.size),shape:q.shape||'shot',size:q.size});};
for(const def of roster){const map=Object.values(G.maps).find(m=>Object.values(m.legend||{}).some(c=>c.enemy===def.id));assert.ok(map,def.id);
 for(const edge of ['north','south','east','west'])for(const phase of (process.argv.includes('--all-phases')?[1,2,3]:[1]))for(const action of (def.id==='tollkeeper'?['courteous-native-opening']:def.boss.patterns||['charge','blades'])){
  Object.assign(G.state.delivery,{started:true,complete:def.id!=='tollkeeper',keeper:false,lamps:[2,2]});G.state.items=Object.keys(G.WORLDWAKE_MARKS).filter(item=>item!==def.trophy);G.state.worldwake=G.normalizeWorldwake(undefined,{items:G.state.items});G.state.groundRewards=[];r.load(map.id);r.drain();const e=G.state.enemies.find(e=>e.id===def.id);assert.ok(e,def.id+' native spawn');G.state.enemies=[e];const p=G.state.player;
  const b=def.worldbearer?{left:Math.max(24,e.x-180),right:Math.min(G.state.mapW*16-24,e.x+180),top:Math.max(24,e.y-120),bottom:Math.min(G.state.mapH*16-24,e.y+120)}:{left:24,right:G.state.mapW*16-24,top:24,bottom:G.state.mapH*16-24};
  const center={x:(b.left+b.right)/2,y:(b.top+b.bottom)/2},target={x:edge==='west'?b.left+4:edge==='east'?b.right-4:center.x,y:edge==='north'?b.top+4:edge==='south'?b.bottom-4:center.y},dir={x:edge==='west'?1:edge==='east'?-1:0,y:edge==='north'?1:edge==='south'?-1:0};
  const clear=(x,y,z)=>[-z,z].every(dx=>[-z,z].every(dy=>!G.world.solid(x+dx,y+dy)));let best=null;
  for(let y=b.top+4;y<=b.bottom-4;y+=4)for(let x=b.left+4;x<=b.right-4;x+=4){const q={x:x+dir.x*56,y:y+dir.y*56};if(!clear(x,y,def.size/2)||!clear(q.x,q.y,6))continue;const cost=Math.hypot(x-target.x,y-target.y);if(!best||cost<best.cost)best={x,y,p:q,cost};}
  assert.ok(best,def.id+'/'+edge);Object.assign(e,{x:best.x,y:best.y,bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:def.hp*(phase===1?1:phase===2?.6:.3),bossSpecialT:.001,bossRecoverT:0,bossPendingAction:null,bossTelegraphT:0,bossPattern:Math.max(0,(def.boss.patterns||['charge','blades']).indexOf(action))});Object.assign(p,{...best.p,mana:0,manaRegenDelay:1000,damageTaken:0});G.state.bossCutscene=null;observe={owner:e,shots:[]};r.step(.01);r.drain();const fields=new Set([...G.state.bossHazards,...G.state.openingHazards].filter(h=>h.owner===e).map(h=>h.kind));
  for(let i=0;i<120&&!G.state.knockout;i++){r.step(.025);r.drain();for(const h of [...G.state.bossHazards,...G.state.openingHazards])if(h.owner===e)fields.add(h.kind);}
  const data={id:def.id,map:map.id,edge,phase,action,pose:{x:best.x,y:best.y},scope:def.worldbearer?'regional home-court native floor':'trial/road native floor',shots:observe.shots,fields:[...fields],knockout:!!G.state.knockout,damage:p.damageTaken};if(data.shots.some(q=>q.blocked))failures.push(data);results.push(data);console.log(JSON.stringify(data));observe=null;
 }
}
console.log(JSON.stringify({guardians:roster.length,actionFixtures:results.length,actualLaunches:results.reduce((n,r)=>n+r.shots.length,0),failures:failures.length,scope:'Independent native-action fixtures, not complete fights, whole attack cycles or a continuous earned campaign.'}));assert.equal(failures.length,0,JSON.stringify(failures));
