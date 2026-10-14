#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-treant-roots',name:'Treant recovery fruit',publishedHost:true,modes:process.argv.includes('--portrait')?['touch']:['touch','controller'],viewports:process.argv.includes('--portrait')?{touch:{width:768,height:1024}}:{},
 async run(ctx){
 const {page,mode,frames,next,drain,shot,reload}=ctx;
 async function art(){
  const before=await page.evaluate(()=>window.reviewTreant.treantCounters||0);
  if(mode==='controller'){
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[1,...Array(15).fill(0)]})));await frames(1);
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
  }else{await page.locator('#btn-a').tap();await frames(1);}
  for(let i=0;i<6&&await page.evaluate(()=>window.reviewTreant.treantCounters||0)===before;i++)await frames(1);
  assert.ok(await page.evaluate(()=>window.reviewTreant.treantCounters||0)>before);
 }
 await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.world.load('heartwood');G.setForm('nobody');const root=G.state.enemies.find(e=>e.treantRoot);Object.assign(G.state.player,{x:root.x+18,y:root.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:100});});
 await frames(25);await drain();await shot('safe-root');await next();await frames(15);await drain();
 assert.equal(await page.evaluate(()=>G.state.guardianChallenges.treant.practiceCleared),true);assert.equal(await page.evaluate(()=>G.state.player.mana),0);await shot('cleared-seat');
 async function walk(x,y){if(mode==='controller'){await page.evaluate(({x,y})=>__nqTvPad(JSON.stringify({t:'s',a:[x,y,0,0],b:Array(16).fill(0)})),{x,y});await frames(1);await page.evaluate(()=>__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));}else{const b=await page.locator('#joy-zone').boundingBox(),cdp=await page.context().newCDPSession(page),x0=b.x+b.width/2,y0=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+x*40,y:y0+y*40,id:2}]});await frames(1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}}
 for(const phase of [1,2,3]){
  await page.evaluate(phase=>{G.healPlayer(99);G.world.load('heartwood');window.reviewTreant=G.state.enemies.find(e=>!e.dead&&e.def.id==='ancientTreant');G.state.enemies=G.state.enemies.filter(e=>e===reviewTreant||e.treantRoot&&!e.treantRoot.owner);Object.assign(reviewTreant,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:reviewTreant.def.hp*(phase===1?1:phase===2?.6:.3),openingTimer:0,treantBranching:true});Object.assign(G.state.player,{x:reviewTreant.x,y:reviewTreant.y+80,mana:0,manaRegenDelay:1000});G.updateOrchardBoss(reviewTreant,G.state.player,.01);window.reviewPrimary=G.state.openingHazards.find(h=>h.owner===reviewTreant&&h.treantAftermath);},phase);await shot('phase-'+phase+'-committed-strike');
  const at=await page.evaluate(phase=>{const positions=reviewPrimary.treantAftermath.positions,at=positions[phase===1?0:positions.length-1];Object.assign(G.state.player,{x:at.x+18,y:at.y,dir:{x:-1,y:0}});return {...at,remaining:reviewPrimary.warn+reviewPrimary.active-reviewPrimary.t};},phase);await frames(Math.ceil(at.remaining/.05)+1);assert.ok(await page.evaluate(()=>G.state.enemies.some(e=>!e.dead&&e.treantRoot?.owner===reviewTreant)));await shot('phase-'+phase+'-harvest-choice');
  const before=await page.evaluate(()=>{G.damagePlayer(1);return G.playerHp();});await art();assert.equal(await page.evaluate(()=>reviewTreant.ward.hp),4);assert.equal(await page.evaluate(()=>reviewTreant.bossStaggerT||0),0);assert.ok(await page.evaluate(()=>G.state.openingHazards.some(h=>h.treantEcho&&h.owner===reviewTreant)));assert.equal(await page.evaluate(()=>G.playerHp()),before,'harvest does not heal remotely');await shot('phase-'+phase+'-apple-waits');
  for(let i=0;i<24&&await page.evaluate(()=>G.state.pickups.some(pk=>pk.treantFruit));i++){const v=await page.evaluate(()=>{const at=G.state.pickups.find(pk=>pk.treantFruit);return{x:at.x-G.state.player.x,y:at.y-G.state.player.y};}),d=Math.hypot(v.x,v.y)||1;await walk(v.x/d,v.y/d);}assert.equal(await page.evaluate(()=>G.state.pickups.some(pk=>pk.treantFruit)),false);assert.equal(await page.evaluate(()=>G.playerHp()),before+1,'native feet collect one restoring apple');await shot('phase-'+phase+'-native-recovery-return');
  if(phase===3){for(let i=0;i<30&&await page.evaluate(()=>G.state.openingHazards.some(h=>h.owner===reviewTreant&&h.treantEcho&&h.t<h.warn+.2));i++)await frames(1);await shot('phase-3-continuing-follower');}
 }
 // Earned post-guardian checkpoint for the world-switch/rematch UI, not a
 // fabricated victory or reward-balance claim.
 await page.evaluate(()=>{G.state.items.push('trophy-heartwood-crown');G.world.load('heartwood');Object.assign(G.state.player,{x:264,y:312});});await frames(2);await drain();await next();await frames(180);await shot('friendly-invitation');await drain();
 assert.equal(await page.evaluate(()=>G.state.guardianChallenges.treant.invited),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:200,y:312}));await frames(2);await shot('branching-lantern-off');
 assert.ok(await page.evaluate(()=>G.openingInteractionCandidate()?.label.includes('Branching Roots')));await next();assert.equal(await page.evaluate(()=>G.treantBranchingLit()),true);await shot('branching-lantern-lit');
 await reload();assert.equal(await page.evaluate(()=>G.treantBranchingLit()),true);assert.equal(await page.evaluate(()=>G.state.guardianChallenges.treant.practiceCleared),true);
 await page.evaluate(()=>Object.assign(G.state.player,{x:264,y:312}));await frames(2);await next();assert.equal(await page.evaluate(()=>G.state.enemies.some(e=>e.treantLocalRematch&&e.treantBranching&&!e.dead)),true);await shot('chosen-rematch');
 await page.evaluate(()=>{const e=G.state.enemies.find(e=>e.treantLocalRematch&&!e.dead);window.reviewTreant=e;Object.assign(G.state.player,{x:e.x,y:e.y+48});});await frames(2);await drain();await frames(5);
 assert.equal(await page.evaluate(()=>G.state.openingHazards.some(h=>h.treantEcho)),true);await shot('branching-first-strike');
 const at=await page.evaluate(()=>{const h=G.state.openingHazards.find(h=>h.treantAftermath),p=h.treantAftermath.positions[0];return{...p,remaining:h.warn+h.active-h.t};});
 await page.evaluate(at=>Object.assign(G.state.player,{x:at.x+18,y:at.y,dir:{x:-1,y:0}}),at);await frames(Math.ceil(at.remaining/.05)+1);await shot('branching-follower-warning');await art();await shot('branching-apple-with-follower');assert.ok(await page.evaluate(()=>G.state.openingHazards.some(h=>h.treantEcho)));assert.ok(await page.evaluate(()=>window.reviewTreant.treantCounters>=1));assert.equal(await page.evaluate(()=>window.reviewTreant.ward.hp),4);assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),false);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),false);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
