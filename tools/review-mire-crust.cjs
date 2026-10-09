#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-mire-crust',name:'Mire crust',publishedHost:true,
 async run({page,mode,frames,next,drain,shot,reload}){
 async function counter(){
  const before=await page.evaluate(()=>window.reviewQueen.mireCounters||0);
  if(mode==='controller'){
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[1,...Array(15).fill(0)]})));await frames(1);
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
  }else{await page.locator('#btn-a').tap();await frames(1);}
  for(let i=0;i<8&&await page.evaluate(()=>window.reviewQueen.mireCounters||0)===before;i++)await frames(1);
  assert.ok(await page.evaluate(()=>window.reviewQueen.mireCounters||0)>before,JSON.stringify(await page.evaluate(()=>({p:{x:G.state.player.x,y:G.state.player.y,dir:G.state.player.dir},e:{x:window.reviewQueen.x,y:window.reviewQueen.y},dialogue:G.ui.dialogueOpen,paint:window.reviewPaint.map(p=>p.text),opening:G.openingInteractionCandidate()?.label,npc:G.npcTalkCandidate?.()?.name,crusts:G.state.enemies.filter(e=>e.mireCrust).map(e=>({x:e.x,y:e.y,dead:e.dead})),shots:G.state.projectiles.filter(s=>s.fromPlayer).map(s=>({x:s.x,y:s.y,vx:s.vx,vy:s.vy}))}))));
 }
 async function bubbles(){
  for(let i=0;i<500&&!await page.evaluate(()=>G.state.bossHazards.some(h=>h.kind==='mirePool'));i++){
   // Position-controlled visual checkpoint; the attack sequence/AI is native.
   await page.evaluate(()=>{const e=window.reviewQueen,h=G.state.bossHazards.find(h=>h.kind==='mireVolley'),s=G.state.projectiles.find(s=>!s.fromPlayer&&s.owner===e&&!s.dispelled);if(h)Object.assign(G.state.player,{x:h.x,y:h.y+52});else if(s){const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),points=[{x:72,y:136},{x:144,y:136},{x:72,y:164},{x:144,y:164}].filter(p=>G.world.isSafeSpawn(p.x,p.y)&&Math.hypot(p.x-e.x,p.y-e.y)<=95);if(!points.length)points.push(G.world.safeArrival(e.x-60,e.y));const safety=p=>Math.min(...shots.map(s=>{const speed=Math.hypot(s.vx,s.vy)||1,dx=s.vx/speed,dy=s.vy/speed,along=Math.max(0,(p.x-s.x)*dx+(p.y-s.y)*dy);return Math.hypot(p.x-s.x-dx*along,p.y-s.y-dy*along);}));points.sort((a,b)=>safety(b)-safety(a));Object.assign(G.state.player,points[0]);}});await frames(1);await drain();
  }
  assert.ok(await page.evaluate(()=>G.state.bossHazards.some(h=>h.kind==='mirePool')),JSON.stringify(await page.evaluate(()=>({map:G.state.mapId,p:{x:G.state.player.x,y:G.state.player.y,hp:G.playerHp()},q:{x:window.reviewQueen.x,y:window.reviewQueen.y,engaged:window.reviewQueen.bossEngaged,pattern:window.reviewQueen.bossPattern,pending:window.reviewQueen.bossPendingAction,recover:window.reviewQueen.bossRecoverT},dialogue:G.ui.dialogueOpen,cut:G.state.bossCutscene,ko:G.state.knockout,shots:G.state.projectiles.map(s=>({x:s.x,y:s.y,vx:s.vx,vy:s.vy,arm:s.armT,startX:s.startX,startY:s.startY,range:s.range,owner:s.owner?.id})),hazards:G.state.bossHazards.length}))));
 }
 async function sidestep(){
  const at=await page.evaluate(()=>{const h=G.state.bossHazards.find(h=>h.mireAftermath);return{x:h.mireAftermath.x,y:h.mireAftermath.y,remaining:Math.max(...G.state.bossHazards.filter(h=>h.kind==='mirePool').map(h=>h.delay+h.warning+h.active-h.t))};});
  // The world positions are fixtures; A uses real touch/TV controls.
  await page.evaluate(at=>Object.assign(G.state.player,{x:at.x+18,y:at.y,dir:{x:-1,y:0}}),at);await frames(Math.ceil(at.remaining/.05)+1);
  assert.ok(await page.evaluate(()=>G.state.enemies.some(e=>!e.dead&&e.mireCrust?.owner===window.reviewQueen)));
 }
 await page.evaluate(()=>{let seed=0x12345678;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.world.load('sunkenMarsh');G.setForm('nobody');const root=G.state.enemies.find(e=>e.mireCrust);Object.assign(G.state.player,{x:root.x+18,y:root.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:1000});});
 await frames(25);await drain();await shot('safe-crust');await next();await frames(15);await drain();
 assert.equal(await page.evaluate(()=>G.state.guardianChallenges.queen.practiceCleared),true);assert.equal(await page.evaluate(()=>G.state.player.mana),0);await shot('lily-light');
 await page.evaluate(()=>{G.state.claimedForms.push('wizard');G.setForm('wizard');window.reviewQueen=G.state.enemies.find(e=>!e.dead&&e.id==='mireQueen');Object.assign(G.state.player,{x:window.reviewQueen.x-60,y:window.reviewQueen.y,mana:0,manaRegenDelay:1000});});
 await frames(2);await drain();await bubbles();await shot('purple-bubbles');await sidestep();await shot('cracked-mire');await counter();await shot('native-splash');await frames(6);await drain();
 assert.equal(await page.evaluate(()=>window.reviewQueen.ward.hp),5);assert.equal(await page.evaluate(()=>G.state.player.mana),0);
 // Owned-pearl/returned-beacon checkpoint for resident/save/switch UI only.
 await page.evaluate(()=>{G.state.player.damageTaken=0;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.world.load('sunkenMarsh');Object.assign(G.state.player,{x:424,y:184});});await frames(2);await drain();await next();await frames(180);await shot('friendly-invitation');await drain();
 assert.equal(await page.evaluate(()=>G.state.guardianChallenges.queen.invited),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:456,y:136}));await frames(2);await shot('ripple-lantern-off');assert.ok(await page.evaluate(()=>G.openingInteractionCandidate()?.label.includes('Rippling Mire')));await next();assert.equal(await page.evaluate(()=>G.mireRipplingLit()),true);await shot('ripple-lantern-lit');
 await reload();assert.equal(await page.evaluate(()=>G.mireRipplingLit()),true);assert.equal(await page.evaluate(()=>G.state.guardianChallenges.queen.practiceCleared),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:424,y:184}));await frames(2);await next();assert.ok(await page.evaluate(()=>G.state.enemies.some(e=>!e.dead&&e.queenLocalRematch&&e.queenRippling)));await shot('chosen-rematch');
 await page.evaluate(()=>{window.reviewQueen=G.state.enemies.find(e=>!e.dead&&e.queenLocalRematch);Object.assign(G.state.player,{x:window.reviewQueen.x-60,y:window.reviewQueen.y});});await frames(2);await drain();await bubbles();assert.ok(await page.evaluate(()=>G.state.bossHazards.some(h=>h.mireRipple)));await shot('ripple-first-bubbles');await sidestep();await shot('following-volley-warning');await counter();await shot('following-volley-cancelled');await frames(6);await drain();assert.equal(await page.evaluate(()=>G.state.bossHazards.length),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
