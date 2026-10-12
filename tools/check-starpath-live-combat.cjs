#!/usr/bin/env node
'use strict';
// Supplied earned chapter/body/initial pose; original health, ward, AI,
// collision, arts and projectile lifetimes. No intervention after starting.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];for(const form of ['stormcaller','colossus','knight'])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,heart,guardian});cases.push({form:'stormcaller',heart:false,guardian:false,first:true});
for(const c of process.argv.includes('--first-only')?cases.filter(c=>c.first):cases){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('stormcaller',c.form);G.questsDone.push(...G.forms.stormcaller.quests.slice(0,3).map(q=>q.id));
 if(!c.first){G.state.items.push('orrery-key');G.state.claimedForms.push('astronomer');}
 G.setForm(c.form);if(c.form!=='stormcaller')G.state.loadouts[c.form]=[G.forms[c.form].basic,'stormSpark'];G.setComfortSetting('easyMode',c.heart);G.setComfortSetting('bossAssistance',c.guardian);r.load('astronomerTrial');r.drain();if(!c.first)assert.ok(G.beginStarpathRematch());
 const e=G.state.enemies.find(e=>!e.dead&&e.id==='professorPerihelion'),p=G.state.player;Object.assign(p,{x:e.x-70,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});let seconds=0,paid=0,earned=0;const caught={},orbits={},comets={};const stars=G.state.stars,items=[...G.state.items];
 G.events.on('orbitShelter',()=>orbits[e.bossPhase]=(orbits[e.bossPhase]||0)+1);G.events.on('projectileBlock',a=>{if(a.kind==='orbitPlanet')caught[e.bossPhase]=(caught[e.bossPhase]||0)+1;});G.events.on('abilityUse',a=>{if(G.abilityManaCost(G.abilities[a.ability])>0)paid++;});G.events.on('questDone',()=>earned++);
 for(let i=0;i<20000&&!e.dead;i++){
  const dt=.025,fields=G.state.bossHazards.filter(h=>h.owner===e),h=fields.find(h=>h.kind==='orbitalBand'),comet=fields.find(h=>h.kind==='starpathComet'),covered=G.starpathPlanets().length>0,need=(caught[e.bossPhase]||0)<1||!comets[e.bossPhase];
  if(comet?.fired)comets[e.bossPhase]=true;
  const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;let target={x:e.x+dx/d*68,y:e.y+dy/d*68};
  if(h){const rad=(h.inner+h.outer)/2;target={x:h.x+dx/d*rad,y:h.y+dy/d*rad};}
  else if(covered&&need){const s=G.state.projectiles.filter(s=>s.owner===e&&!s.fromPlayer&&!s.dispelled&&s.armT<=0).sort((a,b)=>Math.hypot(a.x-p.x,a.y+5-p.y)-Math.hypot(b.x-p.x,b.y+5-p.y))[0];if(s){const m=Math.hypot(s.vx,s.vy)||1;target={x:e.x+s.vx/m*68,y:e.y-6+s.vy/m*68+5};}}
  else if(!need)target={x:e.x+dx/d*54,y:e.y+dy/d*54};
  if(!G.world.isSafeSpawn(target.x,target.y)){const options=Array.from({length:32},(_,j)=>({x:e.x+Math.cos(j*Math.PI/16)*68,y:e.y+Math.sin(j*Math.PI/16)*68})).filter(q=>G.world.isSafeSpawn(q.x,q.y));options.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));target=options[0]||G.world.safeArrival(target.x,target.y);}
  const vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),desired=m>2?{x:vx/m,y:vy/m}:{x:0,y:0};const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  function score(v){let cost=0;const q={...p};for(let j=1;j<=10;j++){const t=j*.06;G.world.moveBox(q,v.x*G.forms[c.form].speed*.06,v.y*G.forms[c.form].speed*.06);cost+=Math.hypot(q.x-target.x,q.y-target.y)*.4;
   if(h){const radius=Math.hypot(q.x-h.x,q.y-h.y),active=h.t+t>=h.warning;if(active)cost+=Math.max(0,h.inner+5-radius)**2*150+Math.max(0,radius-h.outer+5)**2*150;}
   if(!covered)for(const s of G.state.projectiles)if(s.owner===e&&!s.fromPlayer&&!s.dispelled){const scale=G.guidanceProjectileScale(s);if((s.armT||0)>t)continue;cost+=Math.max(0,12+s.size-Math.hypot(q.x-(s.x+s.vx*t*scale),q.y-5-(s.y+s.vy*t*scale)))**2*25;}
   if(comet&&!covered&&comet.t+t>=comet.warning){const sx=comet.x+Math.cos(comet.angle)*125*(comet.t+t-comet.warning),sy=comet.y+Math.sin(comet.angle)*125*(comet.t+t-comet.warning);cost+=Math.max(0,21-Math.hypot(q.x-sx,q.y-5-sy))**2*35;}
  }return cost;}choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];const ax=e.x-p.x,ay=e.y-p.y,ad=Math.hypot(ax,ay)||1;G.input.aim={x:ax/ad,y:ay/ad};if(!need&&ad<100&&!h)r.taps.add(c.form==='stormcaller'?'a':'b');r.step(dt);r.drain();seconds+=dt;
  assert.ok(!G.state.knockout,JSON.stringify({...c,seconds,hp:e.hp,phase:e.bossPhase,damage:p.damageTaken,caught,orbits}));
 }
 assert.ok(e.dead,JSON.stringify({...c,seconds,hp:e.hp,phase:e.bossPhase,caught,orbits}));for(const phase of [1,2,3]){assert.ok(orbits[phase]>0);assert.ok(caught[phase]>0);assert.ok(comets[phase]);}assert.equal(paid,0);assert.equal(G.state.stars,stars+earned);assert.deepEqual([...G.state.items],items);if(c.first){assert.ok(G.groundRewardFor('orrery-key'));G.input.vec={x:0,y:0};collect(r,'orrery-key');assert.equal(G.state.stars,stars+earned+1);assert.ok(G.formReady('astronomer'));assert.ok(G.formEchoFor('astronomer'));assert.equal(G.starpathVisitReady(),false);}else assert.equal(G.groundRewardFor('orrery-key'),null);assert.equal(G.comfortSetting('easyMode'),c.heart);assert.equal(G.comfortSetting('bossAssistance'),c.guardian);
 console.log(JSON.stringify({...c,seconds:+seconds.toFixed(2),damage:p.damageTaken,orbits,caught,comets,paidCasts:paid,respawns:0,ai:'native',hp:66,ward:7}));
}
