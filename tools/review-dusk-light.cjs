#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-dusk-light',name:'Vesper moonlight',publishedHost:true,
 async run({page,mode,frames,next,drain,shot,reload}){
 async function aimArt(x,y){
  if(mode==='controller'){await page.evaluate(({x,y})=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,x,y],b:[1,...Array(15).fill(0)]})),{x,y});await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);}
  else{const b=await page.locator('#btn-a').boundingBox(),cdp=await page.context().newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*35,y:by+y*35,id:1}]});await frames(1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(5);await cdp.detach();}
 }

 async function dash(){
  for(let i=0;i<300&&!await page.evaluate(()=>G.state.enemies.some(c=>!c.dead&&c.moonCover?.owner===window.reviewVesper));i++){
   await page.evaluate(()=>{const e=window.reviewVesper,p=G.state.player;Object.assign(p,G.world.safeArrival(e.x+(p.x<e.x?-65:65),e.y));});await frames(1);await drain();
  }
  assert.ok(await page.evaluate(()=>G.state.enemies.some(c=>!c.dead&&c.moonCover?.owner===window.reviewVesper)));
 }
 async function light(){
  const aim=await page.evaluate(()=>{const e=window.reviewVesper,c=window.reviewCover=G.state.enemies.find(c=>!c.dead&&c.moonCover?.owner===e),a=Math.atan2(c.y-e.y,c.x-e.x);Object.assign(G.state.player,G.world.safeArrival(c.x+Math.cos(a)*20,c.y+Math.sin(a)*20));return{x:-Math.cos(a),y:-Math.sin(a)};});
  await shot('covered-moon-lamp');await aimArt(aim.x,aim.y);assert.equal(await page.evaluate(()=>reviewCover.moonCover.lit),true);assert.equal(await page.evaluate(()=>reviewVesper.duskCounters||0),0);await shot('light-prepares-counter');
  await page.evaluate(()=>{const e=reviewVesper,p=G.state.player;Object.assign(p,G.world.safeArrival(e.x,e.y+(e.y>136?-65:65)));});
  for(let i=0;i<50&&!await page.evaluate(()=>reviewVesper.duskCounters);i++)await frames(1);
  assert.equal(await page.evaluate(()=>reviewVesper.duskCounters),1);assert.equal(await page.evaluate(()=>G.state.bossHazards.length),0);await shot('actual-dash-caught');
 }
 // Chapter, body ownership and positions are controlled checkpoints. The
 // original boss chooses attacks; actual touch/TV arts and travel pay counters.
 await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.world.load('vampireTrial');G.setForm('nobody');const c=G.state.enemies.find(e=>e.moonCover);Object.assign(G.state.player,{x:c.x-18,y:c.y,dir:{x:1,y:0},mana:0,manaRegenDelay:1000});});await frames(30);await drain();await shot('safe-moon-practice');await aimArt(1,0);await shot('saved-practice-light');assert.equal(await page.evaluate(()=>G.state.guardianChallenges.vesper.practiceCleared),true);assert.equal(await page.evaluate(()=>G.state.guardianChallenges.vesper.counterLearned),false);assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);
 await page.evaluate(()=>{window.reviewVesper=G.state.enemies.find(e=>!e.dead&&e.id==='countessCarmine');Object.assign(G.state.player,G.world.safeArrival(reviewVesper.x-65,reviewVesper.y));});await frames(2);await drain();await dash();await light();assert.equal(await page.evaluate(()=>reviewVesper.ward.hp),6);assert.equal(await page.evaluate(()=>reviewVesper.hp),58);
 await page.evaluate(()=>{G.state.claimedForms.push('wizard');G.setForm('wizard');const at=G.helpStations().find(s=>s.kind==='bossAssistance');Object.assign(G.state.player,{x:at.x,y:at.y});});await frames(1);assert.equal(await page.evaluate(()=>G.helpStationCandidate()),null);await aimArt(1,0);assert.ok(await page.evaluate(()=>G.state.player.cooldowns.curse>0));assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),false);assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);await shot('active-fight-keeps-attack');await page.evaluate(()=>G.setForm('nobody'));

 await page.evaluate(()=>{G.state.items.push('crimson-seal');G.world.load('vampireTrial');Object.assign(G.state.player,{x:88,y:168});});await frames(2);await drain();assert.equal(await page.evaluate(()=>G.duskVisitReady()),false);assert.equal(await page.evaluate(()=>G.openingInteractionCandidate()?.id==='vesper-rematch'),false);
 await page.evaluate(()=>{G.state.claimedForms.push('vampire');G.state.formOutings.active={formId:'vampire',scenes:[],arts:[]};});assert.equal(await page.evaluate(()=>G.duskVisitReady()),false);await page.evaluate(()=>{G.state.formOutings.active=null;});await frames(2);await shot('vesper-invitation-prompt');await next();await frames(180);await shot('friendly-tea-invitation');assert.equal(await page.evaluate(()=>G.resolveDialogueSpeaker('VESPER').id),'countessCarmine');await drain();assert.equal(await page.evaluate(()=>G.state.guardianChallenges.vesper.invited),true);assert.equal(await page.evaluate(()=>G.duskRematchActive()),false);await shot('choose-a-dance-prompt');
 await page.evaluate(()=>Object.assign(G.state.player,{x:72,y:200}));await frames(2);assert.ok(await page.evaluate(()=>G.openingInteractionCandidate()?.label.includes('Second Waltz')));await shot('second-waltz-off');await next();assert.equal(await page.evaluate(()=>G.duskSecondLit()),true);await shot('second-waltz-lit');await reload();assert.equal(await page.evaluate(()=>G.duskSecondLit()),true);assert.equal(await page.evaluate(()=>G.state.guardianChallenges.vesper.practiceCleared),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:88,y:168}));await frames(2);await next();await frames(100);await shot('chosen-dance-waits');assert.equal(await page.evaluate(()=>G.state.enemies.find(e=>!e.dead&&e.vesperLocalRematch).bossEngaged),false);
 await page.evaluate(()=>{window.reviewVesper=G.state.enemies.find(e=>!e.dead&&e.vesperLocalRematch);Object.assign(G.state.player,G.world.safeArrival(reviewVesper.x-65,reviewVesper.y));});await frames(2);await drain();await dash();await shot('second-waltz-dash');
 // Deliberately leave the lamp covered and keep feet clear. The original
 // follower warns only after the actual first projectiles and a breather.
 await page.evaluate(()=>{const e=reviewVesper;Object.assign(G.state.player,G.world.safeArrival(e.x,e.y+65));});
 for(let i=0;i<80&&!await page.evaluate(()=>G.state.bossHazards.some(h=>h.duskFollower));i++)await frames(1);
 assert.ok(await page.evaluate(()=>G.state.bossHazards.some(h=>h.duskFollower)));await page.evaluate(()=>{window.reviewFollow=G.state.bossHazards.find(h=>h.duskFollower);const h=reviewFollow;Object.assign(G.state.player,G.world.safeArrival(h.x+Math.cos(h.angle)*60,h.y+Math.sin(h.angle)*60));});await shot('first-waltz-opening');
 for(let i=0;i<100&&!await page.evaluate(()=>reviewFollow.t>=reviewFollow.delay+.25);i++)await frames(1);
 assert.ok(await page.evaluate(()=>G.state.bossHazards.includes(reviewFollow)));assert.equal(await page.evaluate(()=>G.state.projectiles.filter(s=>s.owner===reviewVesper&&!s.fromPlayer&&!s.dispelled).length),0);await shot('following-waltz-breather');assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
