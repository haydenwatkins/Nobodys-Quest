#!/usr/bin/env node
'use strict';
// Early controlled layout preview: supplied chapter/pose, native arts and AI.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'.scratch/verification/vesper/preview',name:'Vesper shadow first slice',publishedHost:true,
 async run({page,mode,frames,drain,shot}){
  async function art(x,y){
   if(mode==='controller'){await page.evaluate(({x,y})=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,x,y],b:[1,...Array(15).fill(0)]})),{x,y});await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(7);}
   else{const b=await page.locator('#btn-a').boundingBox(),cdp=await page.context().newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*35,y:by+y*35,id:1}]});await frames(1);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(7);await cdp.detach();}
  }
  await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.world.load('vampireTrial');G.setForm('nobody');const e=window.reviewVesper=G.state.enemies.find(e=>e.id==='countessCarmine');Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossSpecialT:.001,bossPattern:0});G.state.bossCutscene=null;Object.assign(G.state.player,{x:e.x-60,y:e.y,mana:0,manaRegenDelay:1000});});await frames(1);await drain();
  await page.evaluate(()=>{const c=window.reviewCover=G.state.enemies.find(c=>c.moonCover?.owner===reviewVesper);Object.assign(G.state.player,{x:c.x-18,y:c.y,dir:{x:1,y:0}});});await shot('covered-lamp');await art(1,0);assert.equal(await page.evaluate(()=>reviewCover.moonCover.lit),true);await shot('prepared-light');await page.evaluate(()=>G.state.player.y+=65);
  for(let i=0;i<40&&!await page.evaluate(()=>reviewVesper.duskCounters);i++)await frames(1);assert.equal(await page.evaluate(()=>reviewVesper.duskCounters),1);assert.ok(await page.evaluate(()=>reviewVesper.bossChargeT>0));await shot('actual-dash-continues');
  for(let i=0;i<20&&!await page.evaluate(()=>G.state.bossHazards.some(h=>h.owner===reviewVesper&&h.kind==='crimsonWaltz'));i++)await frames(1);
  await page.evaluate(()=>{G.state.claimedForms.push('wizard');G.setForm('wizard');const at=G.duskShadowPoint(reviewVesper);Object.assign(G.state.player,{x:at.x-18,y:at.y,dir:{x:1,y:0},mana:0,manaRegenDelay:1000});});await frames(1);await shot('reachable-connected-shadow');await art(1,0);
  for(let i=0;i<15&&await page.evaluate(()=>reviewVesper.ward.hp===6);i++)await frames(1);assert.equal(await page.evaluate(()=>reviewVesper.ward.hp),5);assert.equal(await page.evaluate(()=>reviewVesper.hp),58);assert.equal(await page.evaluate(()=>reviewVesper.duskShadowHits),1);await shot('real-free-shadow-ward-contact');
  for(let i=0;i<30&&!await page.evaluate(()=>G.state.projectiles.some(s=>s.owner===reviewVesper&&!s.fromPlayer));i++)await frames(1);await shot('continuing-waltz');assert.equal(await page.evaluate(()=>reviewVesper.bossStaggerT||0),0);assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
