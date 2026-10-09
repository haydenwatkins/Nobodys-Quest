#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-treant-roots',name:'Treant roots',publishedHost:true,
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
 await page.evaluate(()=>{const e=G.state.enemies.find(e=>!e.dead&&e.def.id==='ancientTreant');window.reviewTreant=e;Object.assign(G.state.player,{x:e.x,y:e.y+48,dir:{x:0,y:-1}});});
 await frames(2);await drain();await frames(5);await shot('committed-roots');
 const root=await page.evaluate(()=>{const e=window.reviewTreant,h=G.state.openingHazards.find(h=>h.treantAftermath);return h?{x:h.treantAftermath.x,y:h.treantAftermath.y,remaining:h.warn+h.active-h.t}:null;});assert.ok(root);
 // Controlled sidestep position; the native encounter and art are retained.
 await page.evaluate(root=>Object.assign(G.state.player,{x:root.x+18,y:root.y,dir:{x:-1,y:0}}),root);
 await frames(Math.ceil(root.remaining/.05)+1);await shot('cracked-root');await art();await shot('native-root-tug');await frames(6);await drain();
 assert.ok(await page.evaluate(()=>window.reviewTreant.treantCounters>=1));assert.equal(await page.evaluate(()=>window.reviewTreant.ward.hp),3);
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
 const at=await page.evaluate(()=>{const h=G.state.openingHazards.find(h=>h.treantAftermath);return{x:h.treantAftermath.x,y:h.treantAftermath.y,remaining:h.warn+h.active-h.t};});
 await page.evaluate(at=>Object.assign(G.state.player,{x:at.x+18,y:at.y,dir:{x:-1,y:0}}),at);await frames(Math.ceil(at.remaining/.05)+1);await shot('branching-follower-warning');await art();await shot('branching-follower-cancelled');await frames(6);await drain();
 assert.equal(await page.evaluate(()=>G.state.openingHazards.length),0);assert.ok(await page.evaluate(()=>window.reviewTreant.treantCounters>=1));
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
