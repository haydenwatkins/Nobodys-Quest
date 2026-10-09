#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-eclipse-shield',name:'Eclipse shield',publishedHost:true,
 async run({page,mode,frames,next,drain,shot,reload}){
 async function charge(){for(let i=0;i<300&&!await page.evaluate(()=>G.eclipseShieldRaised(window.reviewKnight));i++){await page.evaluate(()=>{const e=window.reviewKnight,h=G.state.bossHazards.find(h=>h.owner===e);if(h){Object.assign(G.state.player,G.world.safeArrival(h.x-Math.cos(h.angle)*30,h.y-Math.sin(h.angle)*30));}else if(e.bossPendingAction==='eclipseSweep'){Object.assign(G.state.player,G.world.safeArrival(e.x,e.y-95));}else{Object.assign(G.state.player,G.world.safeArrival(e.x+(e.x>405?-24:24),e.y));}});await frames(1);await drain();}assert.ok(await page.evaluate(()=>G.eclipseShieldRaised(window.reviewKnight)),JSON.stringify(await page.evaluate(()=>({map:G.state.mapId,p:{x:G.state.player.x,y:G.state.player.y,hp:G.playerHp()},e:{x:window.reviewKnight.x,y:window.reviewKnight.y,engaged:window.reviewKnight.bossEngaged,pending:window.reviewKnight.bossPendingAction,pattern:window.reviewKnight.bossPattern,tele:window.reviewKnight.bossTelegraphT,recover:window.reviewKnight.bossRecoverT},ko:G.state.knockout,cut:G.state.bossCutscene,dialogue:G.ui.dialogueOpen}))));}
 async function counter(){
  const at=await page.evaluate(()=>{const e=window.reviewKnight,p=G.state.player,dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;return {before:e.eclipseCounters||0,x:dx/d,y:dy/d};});
  if(mode==='controller'){
   await page.evaluate(at=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,at.x,at.y],b:[1,...Array(15).fill(0)]})),at);await frames(1);
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);
  }else{
   const box=await page.locator('#btn-a').boundingBox(),cdp=await page.context().newCDPSession(page),x=box.x+box.width/2,y=box.y+box.height/2;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+at.x*35,y:y+at.y*35,id:1}]});await frames(1);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(5);await cdp.detach();
  }
  for(let i=0;i<12&&await page.evaluate(()=>window.reviewKnight.eclipseCounters||0)===at.before;i++)await frames(1);
  assert.equal(await page.evaluate(()=>window.reviewKnight.eclipseCounters||0),at.before+1);
 }

 await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.world.load('emberRidge');G.setForm('nobody');const e=G.state.enemies.find(e=>e.eclipsePractice);Object.assign(G.state.player,{x:e.x-18,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:1000});});
 await frames(12);await drain();await shot('spare-shield');await next();await frames(12);await shot('saved-shield-light');assert.equal(await page.evaluate(()=>G.state.guardianChallenges.knight.practiceCleared),true);assert.equal(await page.evaluate(()=>G.state.player.mana),0);
 // Geometry/chapter fixtures only. The original Knight chooses his own actions.
 await page.evaluate(()=>{G.state.claimedForms.push('wizard');G.setForm('wizard');window.reviewKnight=G.state.enemies.find(e=>!e.dead&&e.id==='eclipseKnight');Object.assign(G.state.player,{x:window.reviewKnight.x+24,y:window.reviewKnight.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:1000});});
 await frames(2);await drain();await charge();await shot('raised-shield-warning');await counter();await shot('native-clang');assert.equal(await page.evaluate(()=>window.reviewKnight.ward.hp),6);assert.equal(await page.evaluate(()=>window.reviewKnight.hp),42);assert.equal(await page.evaluate(()=>G.state.player.mana),0);
 // Owned-Sigil checkpoint: use actual Ser Pending return before the invitation.
 await page.evaluate(()=>{G.state.items.push('trophy-eclipse-sigil');G.state.player.damageTaken=0;G.world.load('emberRidge');Object.assign(G.state.player,{x:40,y:120});});await frames(2);await drain();assert.equal(await page.evaluate(()=>G.eclipseVisitReady()),false);await next();await frames(180);await shot('ser-pending-good-news');await drain();assert.equal(await page.evaluate(()=>G.eclipseVisitReady()),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:88,y:152}));await frames(2);await next();await frames(180);await shot('friendly-invitation');await drain();assert.equal(await page.evaluate(()=>G.state.guardianChallenges.knight.invited),true);assert.equal(await page.evaluate(()=>G.eclipseRematchActive()),false);
 await page.evaluate(()=>Object.assign(G.state.player,{x:72,y:200}));await frames(2);assert.ok(await page.evaluate(()=>G.openingInteractionCandidate()?.label.includes('Following Crescent')));await shot('crescent-lantern-off');await next();assert.equal(await page.evaluate(()=>G.eclipseCrescentLit()),true);await shot('crescent-lantern-lit');
 await reload();assert.equal(await page.evaluate(()=>G.eclipseCrescentLit()),true);assert.equal(await page.evaluate(()=>G.state.guardianChallenges.knight.practiceCleared),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:88,y:152}));await frames(2);await next();assert.ok(await page.evaluate(()=>G.state.enemies.some(e=>!e.dead&&e.knightLocalRematch&&e.knightCrescent)));await shot('chosen-rematch-waits');await frames(120);assert.equal(await page.evaluate(()=>G.state.enemies.find(e=>!e.dead&&e.knightLocalRematch).bossEngaged),false);
 await page.evaluate(()=>{window.reviewKnight=G.state.enemies.find(e=>!e.dead&&e.knightLocalRematch);Object.assign(G.state.player,{x:window.reviewKnight.x+24,y:window.reviewKnight.y,dir:{x:-1,y:0}});});await frames(2);await drain();await charge();await shot('chosen-raised-shield');
 const left=await page.evaluate(()=>{const e=window.reviewKnight;G.state.player.y+=60;return e.bossTelegraphT+e.def.boss.chargeDur;});await frames(Math.ceil(left/.05)+1);assert.ok(await page.evaluate(()=>G.state.bossHazards.some(h=>h.kind==='eclipseSweep')));await shot('following-crescent-warning');
 // Clear safe ground for the fallback; no HP/AI/invulnerability modification.
 await page.evaluate(()=>{const h=G.state.bossHazards.find(h=>h.kind==='eclipseSweep');Object.assign(G.state.player,{x:h.x-Math.cos(h.angle)*30,y:h.y-Math.sin(h.angle)*30});});await frames(45);await drain();
 await page.evaluate(()=>{const e=window.reviewKnight,side=e.x>405?-1:1;Object.assign(G.state.player,{x:e.x+side*24,y:e.y,dir:{x:-side,y:0}});});await charge();await counter();await shot('charge-pair-cancelled');assert.equal(await page.evaluate(()=>window.reviewKnight.bossAfterCharge),null);assert.equal(await page.evaluate(()=>G.state.bossHazards.length),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
