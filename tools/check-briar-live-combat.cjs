#!/usr/bin/env node
'use strict';
// Earned checkpoint and initial pose. Native arts/AI/wards/physics throughout.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['wizard','knight','colossus'])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,heart,guardian});cases.push({form:'wizard',heart:false,guardian:false,first:true},{form:'wizard',heart:false,guardian:false,walking:true},{form:'colossus',heart:true,guardian:true,walking:true});
for(const c of (process.argv.includes('--first-only')?cases.filter(c=>c.first):process.argv.includes('--walking-only')?cases.filter(c=>c.walking):cases)){
 const {form,heart,guardian,first=false,walking=false}=c,r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('rat','knight','wizard','ranger','frog','alchemist',form);G.questsDone.push(...G.forms.wizard.quests.slice(0,3).map(q=>q.id));G.state.stars=28;if(!first){G.state.items.push('elder-acorn');G.state.claimedForms.push('druid');}G.setForm(form);if(form!=='wizard')G.state.loadouts[form]=[G.forms[form].basic,'curse'];
 G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);r.load('druidTrial');r.drain();if(!first)assert.ok(G.beginBriarRematch());
 const e=G.state.enemies.find(a=>!a.dead&&a.id==='grandmotherBriar'),p=G.state.player;Object.assign(p,{x:e.x-70,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const hits=[];G.events.on('playerHurt',v=>hits.push({from:v,phase:e.bossPhase,action:e.bossPendingAction,charge:e.bossChargeT,fields:G.state.bossHazards.map(h=>({x:h.x,y:h.y,t:h.t,warning:h.warning})),x:p.x,y:p.y}));
 const startStars=G.state.stars,startItems=[...G.state.items],byPhase={},chosen={},revisited=new Set(),used=new Set();let earned=0,gifts=0,seconds=0,paid=0;
 G.events.on('questDone',()=>earned++);G.events.on('pickup',a=>{if(a.item==='elder-acorn')gifts++;});G.events.on('abilityUse',a=>{if(G.abilityManaCost(G.abilities[a.ability])>0)paid++;});
 G.events.on('guardianCounter',a=>{if(a.guardian==='grandmotherBriar'){byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;const prop=G.state.enemies.find(a=>a.guardianProp?.owner===e&&a.guardianProp.phase===e.bossPhase&&a.dead&&Math.hypot(a.x-p.x,a.y-p.y)<45);if(prop&&!chosen[e.bossPhase])chosen[e.bossPhase]={x:prop.x,y:prop.y,pattern:e.bossPattern};}});
 for(let i=0;i<22000&&!e.dead;i++){
  const dt=.025,phase=e.bossPhase,fields=G.state.bossHazards.filter(h=>h.owner===e&&!h.cancelled),buds=G.state.enemies.filter(a=>G.guardianPropLive(a)&&a.guardianProp.owner===e);
  const angle=Math.atan2(p.y-e.y,p.x-e.x)+.25;let target={x:e.x+Math.cos(angle)*(walking?30:42),y:e.y+Math.sin(angle)*(walking?30:42)},aim=e,attack=false;
  if(!walking&&!chosen[phase]&&buds.length){
   buds.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const bud=buds[0];
   const spots=Array.from({length:16},(_,j)=>({x:bud.x+Math.cos(j*Math.PI/8)*18,y:bud.y+Math.sin(j*Math.PI/8)*18})).filter(s=>G.world.isSafeSpawn(s.x,s.y));spots.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));target=spots[0]||target;aim=bud;attack=Math.hypot(bud.x-p.x,bud.y-p.y)<28;
  }else if(!walking&&chosen[phase]&&!used.has(phase)){
   target=chosen[phase];const needed=phase===2?4:2;
   if(fields.some(h=>h.briarBed)&&e.bossPattern>=chosen[phase].pattern+needed){revisited.add(phase);if(Math.hypot(p.x-target.x,p.y-target.y)<16&&fields.some(h=>h.t>h.warning&&h.t<h.warning+h.active))used.add(phase);}
  }else{attack=(walking||!!chosen[phase])&&Math.hypot(e.x-p.x,e.y-p.y)<(walking?35:115);}
  if(e.bossPendingAction==='charge'||e.bossChargeT>0){const dx=e.bossChargeX||1,dy=e.bossChargeY||0;target={x:p.x-dy*45,y:p.y+dx*45};attack=false;}
  if(!G.world.isSafeSpawn(target.x,target.y))target=G.world.safeArrival(target.x,target.y);
  const ax=aim.x-p.x,ay=aim.y-p.y,ad=Math.hypot(ax,ay)||1;G.input.aim={x:ax/ad,y:ay/ad};if(attack)r.taps.add(form==='wizard'?'a':'b');
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),desired=d>2?{x:dx/d,y:dy/d}:{x:0,y:0},speed=G.forms[form].speed,choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  const score=v=>{const predicted={...p};let cost=0;for(let j=1;j<=24;j++){const t=j*.025;G.world.moveBox(predicted,v.x*speed*.025,v.y*speed*.025);const x=predicted.x,y=predicted.y;if(j===10)cost+=Math.hypot(x-target.x,y-target.y);
   for(const h of fields){const age=h.t+t-(h.delay||0);if(age>=h.warning&&age<h.warning+h.active)cost+=Math.max(0,h.radius+7-Math.hypot(x-h.x,y-h.y))**2*25;}
   for(const s of G.state.projectiles)if(s.owner===e&&!s.fromPlayer&&!s.dispelled){if(t<s.armT)continue;const scale=G.guidanceProjectileScale?.(s)??1;cost+=Math.max(0,(s.size||3)+10-Math.hypot(x-s.x-s.vx*t*scale,y-5-s.y-s.vy*t*scale))**2*30;}
   if(e.bossPendingAction==='charge'||e.bossChargeT>0){const start=e.bossTelegraphT>0?e.bossTelegraphT:0;if(t>start&&t<start+(e.bossChargeT||e.def.boss.chargeDur)){const moved=t-start,x2=e.x+e.bossChargeX*e.def.boss.chargeSpeed*moved,y2=e.y+e.bossChargeY*e.def.boss.chargeSpeed*moved;cost+=Math.max(0,22-Math.hypot(x-x2,y-y2))**2*45;}}
  }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({...c,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,byPhase,used:[...used],hits,x:p.x,y:p.y}));
 }
 assert.ok(e.dead,JSON.stringify({...c,seconds,hp:e.hp,ward:e.ward.hp,byPhase,used:[...used],chosen,x:p.x,y:p.y}));assert.equal(e.bossPhase,3);
 if(!walking)for(const phase of [1,2,3]){assert.ok(byPhase[phase]>=1,JSON.stringify({...c,phase,byPhase,chosen,used:[...used]}));assert.ok(revisited.has(phase));assert.ok(used.has(phase));}
 assert.equal(paid,0);assert.equal(G.state.stars,startStars+earned);assert.equal(gifts,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('elder-acorn'));G.input.vec={x:0,y:0};collect(r,'elder-acorn');assert.equal(gifts,1);assert.equal(G.state.stars,startStars+earned+1);assert.equal(G.briarVisitReady(),false);assert.ok(G.formReady('druid'));assert.ok(G.formEchoFor('druid'));}
 assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 console.log(JSON.stringify({...c,seconds:+seconds.toFixed(2),prunes:e.briarPrunes||0,byPhase,revisited:[...revisited],used:[...used],damage:p.damageTaken,paidCasts:paid,ai:'original',respawns:0}));
}
