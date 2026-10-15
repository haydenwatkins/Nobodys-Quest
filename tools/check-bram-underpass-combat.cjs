#!/usr/bin/env node
'use strict';
// Earned checkpoint; original AI, full health/ward, timers and vulnerability.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['nobody','colossus'])for(const rumble of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,rumble,heart,guardian});cases.push({form:'nobody',rumble:false,heart:true,guardian:false,first:true});cases.push({form:'nobody',rumble:false,heart:false,guardian:false,first:true,walking:true});
for(const {form,rumble,heart,guardian,first=false,walking=false} of (process.argv.includes('--first-only')?cases.filter(c=>c.first):process.argv.includes('--baseline-only')?cases.slice(0,1):process.argv.includes('--walking-only')?cases.filter(c=>c.walking):cases)){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('ranger','frog',form);G.questsDone.push(...G.forms.frog.quests.slice(0,2).map(q=>q.id));
 if(!first){G.state.items.push('mole-crown');G.state.claimedForms.push('mole');}Object.assign(G.state.guardianChallenges.bram,{counterLearned:!first,rootRumble:rumble});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);G.setForm(form);assert.equal(G.state.formId,form);G.state.loadouts[form]=form==='colossus'?['pillarFist','arrow']:['slap','arrow'];
 r.load('moleTrial');r.drain();if(!first)assert.ok(G.beginBurrowRematch());const e=G.state.enemies.find(e=>!e.dead&&e.id==='moleMonarch'),p=G.state.player;
 Object.assign(p,{x:e.x-65,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items],byPhase={},burrowByPhase={},returnByPhase={},approached=new WeakSet();let earned=0,gifts=0,seconds=0,paid=0,burrowAnswers=0;
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='mole-crown')gifts++;});G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('guardianCounter',a=>{if(a.guardian==='moleMonarch'){if(process.argv.includes('--trace'))console.error(JSON.stringify({stage:'actual traversal',phase:e.bossPhase,seconds}));const path=G.state.enemies.find(z=>z.burrowPlug?.owner===e&&z.burrowPlug.passage?.uses>=2);if(path)returnByPhase[e.bossPhase]=true;byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;if(a.kind==='underpass'){burrowAnswers++;burrowByPhase[e.bossPhase]=(burrowByPhase[e.bossPhase]||0)+1;}}});
 for(let i=0;i<18000&&!e.dead;i++){
  const dt=.025,roots=G.state.enemies.filter(m=>!m.dead&&m.burrowPlug?.owner===e),root=walking||byPhase[e.bossPhase]&&(!rumble||returnByPhase[e.bossPhase])?null:roots.find(m=>m.burrowPlug.passage)||roots.find(m=>m.burrowPlug.broken)||roots[0],fields=G.state.bossHazards.filter(h=>h.owner===e),charge=(e.bossPendingAction==='burrow'&&e.bossTelegraphT>0)||e.bossChargeT>0;
  r.taps.clear();let target={x:e.x+(e.x>224?-80:80),y:e.y},aim=e,attack=null,tunneling=false;
  const answered=walking||byPhase[e.bossPhase]&&(!rumble||returnByPhase[e.bossPhase]);
  if(root&&root.burrowPlug.passage){
    const path=root.burrowPlug.passage,arrival=p.burrowArrival?.root===root,from=path.from,to=path.to,dx=to.x-from.x,dy=to.y-from.y,d=Math.hypot(dx,dy),uses=path.uses;
    if(uses===0){target={x:from.x-dx/d*12,y:from.y-dy/d*12};if(Math.hypot(p.x-target.x,p.y-target.y)<3)approached.add(path);if(approached.has(path))target=to;tunneling=true;}
    else if(uses<(path.maxUses||1)&&rumble){
      if(arrival)target={x:to.x+dx/d*13,y:to.y+dy/d*13};else target=from;tunneling=true;
    }
  }else if(root){
    const a=Math.atan2(root.y-e.y,root.x-e.x),distance=root.burrowPlug.broken?65:20;
    target={x:root.x+Math.cos(a)*distance,y:root.y+Math.sin(a)*distance};aim=root;
    if(!root.burrowPlug.broken&&Math.hypot(p.x-root.x,p.y-root.y)<(form==='colossus'?30:25))attack='a';
  }
  if(charge&&!p.burrowTransit){const nx=-e.bossChargeY,ny=e.bossChargeX,side=(p.x-e.x)*nx+(p.y-e.y)*ny>=0?1:-1;target={x:(root?.x||e.x)+nx*side*32,y:(root?.y||e.y)+ny*side*32};}
  else if(!root&&answered&&!fields.length&&e.bossRecoverT>.45){const distance=e.ward.hp>0?(form==='colossus'?28:20):65;target={x:e.x+(p.x<e.x?-distance:distance),y:e.y};if(Math.hypot(p.x-e.x,p.y-e.y)<(e.ward.hp>0?(form==='colossus'?35:26):100))attack=e.ward.hp>0?'a':'b';}
  if(process.argv.includes('--trace')&&i%200===0&&i<6000)console.error(JSON.stringify({seconds,stage:'pilot',byPhase,returnByPhase,e:{x:e.x,y:e.y,pattern:e.bossPattern,pending:e.bossPendingAction,recover:e.bossRecoverT,special:e.bossSpecialT},p:{x:p.x,y:p.y},roots:roots.map(z=>({x:z.x,y:z.y,loose:z.burrowPlug.broken,path:!!z.burrowPlug.passage,dig:!!z.burrowPlug.dig})),target}));
  if(!G.world.isSafeSpawn(target.x,target.y))target=G.world.safeArrival(target.x,target.y);
  const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};if(attack)r.taps.add(attack);
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>2?{x:vx/m,y:vy/m}:{x:0,y:0},speed=G.forms[form].speed;
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{const toward=m>0?(v.x*vx+v.y*vy)/m:0,travel=toward>.99?Math.min(speed*.2,m):speed*.2;let cost=Math.hypot(p.x+v.x*travel-target.x,p.y+v.y*travel-target.y);
   for(let j=1;j<=6;j++){const t=j*.08,walk=toward>.99?Math.min(speed*t,m):speed*t,x=p.x+v.x*walk,y=p.y+v.y*walk;if(!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const h of fields){const ht=h.t+t-(h.delay||0);if(ht>=h.warning&&ht<h.warning+h.active&&!G.burrowShelters(p,e,h)&&!tunneling)cost+=Math.max(0,h.radius+10-Math.hypot(x-h.x,y-h.y))**2*12;}
    if(charge){const wait=e.bossChargeT>0?0:e.bossTelegraphT,travel=e.def.boss.chargeSpeed*Math.min(Math.max(0,t-wait),e.bossChargeT>0?e.bossChargeT:e.def.boss.chargeDur);const bx=e.x+e.bossChargeX*travel,by=e.y+e.bossChargeY*travel;cost+=Math.max(0,24-Math.hypot(x-bx,y-by))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({form,rumble,heart,guardian,walking,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y,pending:e.bossPendingAction}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,rumble,heart,guardian,walking,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,x:e.x,y:e.y,px:p.x,py:p.y}));assert.equal(e.bossPhase,3);if(walking)assert.equal(e.burrowTunnelUses||0,0);else for(const phase of [1,2,3])assert.ok(byPhase[phase]>=1);assert.equal(paid,0);assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('mole-crown'));G.input.vec={x:0,y:0};collect(r,'mole-crown');assert.equal(G.state.stars,startStars+earned+1);assert.equal(gifts,1);assert.equal(G.burrowVisitReady(),false);assert.ok(G.formReady('mole'));assert.ok(G.formEchoFor('mole'));assert.ok(!G.state.claimedForms.includes('mole'));}else assert.equal(G.groundRewardFor('mole-crown'),null);
 assert.equal(G.state.guardianChallenges.bram.rootRumbleCleared,rumble);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({form,rumble,heart,guardian,first,walking,seconds:+seconds.toFixed(2),counters:e.burrowTunnelUses,native:{hp:e.def.hp,ward:e.def.ward.hp,speed:e.def.speed},burrowAnswers,burrowByPhase,byPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,ai:'original'}));
}
