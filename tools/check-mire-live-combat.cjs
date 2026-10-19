#!/usr/bin/env node
'use strict';
// Earned-body checkpoint; original Queen and all nine regional enemies.
// Deliberately learn a counter in each phase; timings are not speedrun balance.
// Wizard spends naturally earned mana; Cragback borrows the free Curse.
// No HP, ward, AI, timers or invulnerability changes during combat.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),collect=require('../tests/helpers/collect-treasure.cjs');
const cases=[];
for(const form of ['wizard','colossus'])for(const rippling of [false,true])for(const heart of [false,true])for(const guardian of [false,true])cases.push({form,rippling,heart,guardian});
cases.push({form:'wizard',rippling:false,heart:true,guardian:false,first:true});
cases.push({form:'wizard',rippling:false,heart:false,guardian:false,walking:true},{form:'colossus',rippling:true,heart:true,guardian:true,walking:true});
for(const heart of [false,true])for(const guardian of [false,true])cases.push({form:'ranger',rippling:false,heart,guardian,manyfold:true});
for(const {form,rippling,heart,guardian,first=false,walking=false,manyfold=false} of (process.argv.includes('--bloom-pilot')?cases.filter(c=>c.form==='colossus'&&c.rippling&&!c.heart&&!c.guardian&&!c.walking):process.argv.includes('--manyfold-only')?cases.filter(c=>c.manyfold):process.argv.includes('--walking-only')?cases.filter(c=>c.walking):process.argv.includes('--first-only')?cases.filter(c=>c.first):cases.filter(c=>!c.manyfold))){
 const r=runtime(),{G}=r;let seed=0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;
 G.state.claimedForms.push('wizard',form);G.setForm(form);if(form==='colossus')G.state.loadouts.colossus=['pillarFist','curse'];if(form==='ranger')G.state.loadouts.ranger=['arrow','curse'];
 if(!first){G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');}
 Object.assign(G.state.guardianChallenges.queen,{counterLearned:!first,rippling});G.setComfortSetting('easyMode',heart);G.setComfortSetting('bossAssistance',guardian);
 let roundSeed=null;if(manyfold){G.state.stars=50;G.state.items.push(...Object.values(G.enemies).filter(z=>z.miniboss&&z.trophy).map(z=>z.trophy));G.state.guardianChallenges.queen.rippling=true;const pool=G.gauntletBossPool();for(let candidate=1;candidate<10000;candidate++){let n=candidate,a=[...pool];for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=Math.floor(n/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a[0]==='mireQueen'){roundSeed=candidate;break;}}assert.ok(roundSeed);seed=roundSeed;assert.ok(G.startGauntlet(3,false));G.updateGauntlet(1.2);r.drain();}else{r.load('sunkenMarsh');r.drain();if(!first)assert.ok(G.beginMireRematch());}
 const e=G.state.enemies.find(e=>!e.dead&&e.id==='mireQueen'),p=G.state.player;assert.equal(G.state.formId,form);if(manyfold)assert.ok(!e.queenRippling);assert.equal(e.hp,36);assert.equal(e.ward.hp,5);assert.equal(e.def.speed,32);
 Object.assign(p,{x:e.x-60,y:e.y,mana:0,manaRegenDelay:1000});G.input.takeAim=()=>({...G.input.aim,dragged:true});
 const startStars=G.state.stars,startItems=[...G.state.items];let earned=0,pearls=0,seconds=0,maxPhase=0,paid=0,avoid=null;
 const byPhase={},blocks={},blooms={},wideBlocks={},seenBlooms=new Set();G.events.on('abilityUse',({ability})=>{if(G.abilityManaCost(G.abilities[ability])>0)paid++;});G.events.on('questDone',()=>earned++);G.events.on('pickup',e=>{if(e.item==='trophy-mire-pearl')pearls++;});
 if(process.argv.includes('--trace'))G.events.on('playerHurt',a=>console.error(JSON.stringify({hurt:a,seconds,phase:e.bossPhase,queen:{x:e.x,y:e.y},others:G.state.enemies.filter(z=>!z.dead&&!z.def.practice&&z!==e).map(z=>({id:z.id,x:z.x,y:z.y})),p:{x:p.x,y:p.y}})));
 G.events.on('guardianCounter',({guardian})=>{if(guardian==='mireQueen')byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;});
 function aim(x,y){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};}
 for(let i=0;i<20000&&!e.dead;i++){
  const dt=.025;seconds+=dt;const root=walking?null:G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e),fields=G.state.bossHazards.filter(h=>h.owner===e),primary=fields.filter(h=>h.kind==='mirePool'&&!h.mireRipple),ripple=fields.find(h=>h.mireRipple),channel=e.mireChannel;
  function wideSpot(at){const dx=channel.x2-channel.x,dy=channel.y2-channel.y,d=Math.hypot(dx,dy)||1;return [-1,1].map(side=>({x:at.x-dy/d*24*side,y:at.y+dx/d*24*side})).filter(p=>G.world.isSafeSpawn(p.x,p.y)).sort((a,b)=>{const foes=G.state.enemies.filter(z=>!z.dead&&!z.def.practice&&z!==e),distance=p=>Math.min(...foes.map(z=>Math.hypot(p.x-z.x,p.y-z.y)));return distance(b)-distance(a);})[0]||at;}
  if(process.argv.includes('--trace')&&i%400===0)console.error(JSON.stringify({seconds,phase:e.bossPhase,hp:e.hp,p:{x:p.x,y:p.y},channel,blooms,blocks,wideBlocks,fields:fields.map(h=>({kind:h.kind,t:h.t,delay:h.delay,committed:h.mireCommitted,x:h.x,y:h.y}))}));
  let target={x:e.x-60,y:e.y};
  if(root){target={x:root.x+18,y:root.y};if(Math.hypot(root.x-p.x,root.y-p.y)<=23){aim(root.x,root.y);r.taps.add('a');}}
  else if(!walking&&ripple&&channel){target=ripple.mireCommitted?wideSpot(ripple):{x:channel.x+(channel.x2-channel.x)*.65,y:channel.y+(channel.y2-channel.y)*.65};}
  else if(!walking&&channel?.bloom&&!(wideBlocks[e.bossPhase]>0)){target=wideSpot(channel.bloom);}
  else if(e.mireChannel&&(fields.some(h=>h.kind==='mireVolley')||G.state.projectiles.some(s=>s.owner===e&&!s.fromPlayer&&!s.dispelled))){const c=e.mireChannel;target=c.bloom?wideSpot(c.bloom):{x:(c.x+c.x2)/2,y:(c.y+c.y2)/2};}
  else if(primary.length){const at=primary.find(h=>h.mireAftermath)?.mireAftermath||primary[0];target={x:at.x-27,y:at.y};}
  else if((walking||((byPhase[e.bossPhase]||0)>0&&(blocks[e.bossPhase]||0)>0&&(!rippling||(blooms[e.bossPhase]>0&&wideBlocks[e.bossPhase]>0))))&&(!fields.length&&e.bossIntroT<=0)&&!G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   target={x:e.x-48,y:e.y};if(Math.hypot(e.x-p.x,e.y-p.y)<=68){aim(e.x,e.y);r.taps.add(form==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  }else if(fields.some(h=>h.kind==='mireVolley')){
   const h=fields.find(h=>h.kind==='mireVolley'),a=Math.atan2(h.y-e.y,h.x-e.x);avoid={x:h.x-Math.sin(a)*52,y:h.y+Math.cos(a)*52};target=avoid;
  }else if(G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)&&avoid){target=avoid;
  }else if(e.bossPendingAction==='nova'||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   // Stand halfway between native radial spokes; fan shots keep their old target.
   const n=e.bossPhase>=3?20:e.bossPhase===2?16:12,a=Math.PI+Math.PI/n;
   target={x:e.x+100*Math.cos(a),y:e.y+100*Math.sin(a)};avoid=null;
  }
  if((walking||((byPhase[e.bossPhase]||0)>0&&(blocks[e.bossPhase]||0)>0&&(!rippling||(blooms[e.bossPhase]>0&&wideBlocks[e.bossPhase]>0))))&&!root&&!primary.length&&Math.hypot(e.x-p.x,e.y-p.y)<125){aim(e.x,e.y);r.taps.add(form==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  // Regional creatures remain real opponents. Answer an approaching body
  // with the worn free art instead of withholding every attack for Queen's
  // acceptance checkpoint while a bat repeatedly touches the player.
  const threat=G.state.enemies.filter(z=>!z.dead&&!z.def.practice&&z!==e&&Math.hypot(z.x-p.x,z.y-p.y)<(form==='wizard'?48:34)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(threat){r.taps.delete('a');r.taps.delete('b');aim(threat.x,threat.y);r.taps.add('a');}
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),desired=d>1.5?{x:dx/d,y:dy/d}:{x:0,y:0};
  const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),speed=G.forms[form].speed*G.mireWalkingScale(p);
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  // Replan feet steering every frame; do not treat a wall almost a
  // second away as a collision now. Keep the full danger forecast.
  const score=v=>{const along=d?(v.x*dx+v.y*dy)/d:0,travel=along>.99?Math.min(speed*.3,d):speed*.3;let cost=Math.hypot(p.x+v.x*travel-target.x,p.y+v.y*travel-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,advance=along>.99?Math.min(speed*t,d):speed*t,x=p.x+v.x*advance,y=p.y+v.y*advance;if(t<=.3&&!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const z of G.state.enemies)if(!z.dead&&!z.def.practice&&!z.def.miniboss&&!z.status?.stun){const zx=z.x+(z.dir?.x||0)*z.def.speed*t,zy=z.y+(z.dir?.y||0)*z.def.speed*t;cost+=Math.max(0,8+z.def.size/2-Math.hypot(x-zx,y-zy))**2*30;}
    for(const s of shots){if(t<s.armT||G.mireShelters({x,y},s.owner))continue;const scale=G.guidanceProjectileScale?.(s)??1,sx=s.x+s.vx*t*scale,sy=s.y+s.vy*t*scale,dist=Math.hypot(x-sx,y-5-sy);cost+=Math.max(0,(s.size||3)+11-dist)**2*15;}
    for(const h of primary){const age=h.t+t;if(!G.mireShelters({x,y},h.owner)&&age>=h.delay+h.warning&&age<h.delay+h.warning+h.active)cost+=Math.max(0,h.radius+6-Math.hypot(x-h.x,y-h.y))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];const observedPhase=e.bossPhase,damage=p.damageTaken,invuln=p.invuln,beforeShots=[...G.state.projectiles];r.step(dt);r.drain();
  if(e.mireChannel?.bloom&&!seenBlooms.has(e.mireChannel.bloom)){seenBlooms.add(e.mireChannel.bloom);blooms[observedPhase]=(blooms[observedPhase]||0)+1;}
  if(e.bossPhase===observedPhase&&p.damageTaken===damage&&invuln<=0&&G.mireShelters(p,e))for(const s of beforeShots){
   if(s.owner===e&&!s.fromPlayer&&!s.dispelled&&s.armT<=0&&!G.state.projectiles.includes(s)&&Math.hypot(s.x-p.x,s.y-(p.y-5))<s.size+5&&s.travel<s.range){blocks[observedPhase]=(blocks[observedPhase]||0)+1;const c=e.mireChannel,dx=c.x2-c.x,dy=c.y2-c.y,sq=dx*dx+dy*dy,t=sq?Math.max(0,Math.min(1,((p.x-c.x)*dx+(p.y-c.y)*dy)/sq)):0;if(Math.hypot(p.x-c.x-dx*t,p.y-c.y-dy*t)>14)wideBlocks[observedPhase]=(wideBlocks[observedPhase]||0)+1;}
  }maxPhase=Math.max(maxPhase,e.bossPhase||0);
  assert.ok(!G.state.knockout,JSON.stringify({form,rippling,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,counters:e.mireCounters,byPhase,x:p.x,y:p.y}));
 }
 assert.equal(e.dead,true,JSON.stringify({form,rippling,heart,guardian,seconds,hp:e.hp,ward:e.ward.hp,counters:e.mireCounters,damage:p.damageTaken,byPhase,blocks,blooms,wideBlocks}));
 assert.equal(maxPhase,3);if(!walking)for(const phase of [1,2,3]){assert.ok(byPhase[phase]>=1);assert.ok(blocks[phase]>=1,JSON.stringify({form,rippling,heart,guardian,blocks,byPhase}));if(rippling){assert.ok(blooms[phase]>=1);assert.ok(wideBlocks[phase]>=1);}}else if(form==='wizard')assert.equal(e.mireCounters||0,0);assert.equal(G.state.guardianChallenges.queen.counterLearned,true);assert.equal(G.state.stars,startStars+earned);assert.equal(pearls,0);assert.deepEqual([...G.state.items],startItems);
 if(first){assert.ok(G.groundRewardFor('trophy-mire-pearl'));G.input.vec={x:0,y:0};collect(r,'trophy-mire-pearl');assert.equal(G.state.stars,startStars+earned+1);assert.equal(pearls,1);assert.equal(G.mireVisitReady(),false);}else assert.equal(G.groundRewardFor('trophy-mire-pearl'),null);
 assert.equal(G.state.guardianChallenges.queen.ripplingCleared,rippling);assert.equal(G.comfortSetting('easyMode'),heart);assert.equal(G.comfortSetting('bossAssistance'),guardian);
 if(manyfold){assert.equal(G.state.gauntletRun.wins,1);assert.equal(G.mireRipplingLit(),true);}
 console.log(JSON.stringify({form,rippling,heart,guardian,first,walking,manyfold,roundSeed,seconds:+seconds.toFixed(2),counters:e.mireCounters,byPhase,blocks,blooms,wideBlocks,phases:maxPhase,damage:p.damageTaken,mana:p.mana,paidCasts:paid,respawns:0,ai:'original',regionalEnemies:manyfold?0:9}));
}
