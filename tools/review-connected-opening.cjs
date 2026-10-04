#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-connected-review',name:'walked opening roads and Rat passages',publishedHost:true,
 async run({page,mode,frames,next,drain,walkTo,walkGift,shot,reload}){
  const point=(x,y)=>walkTo(x*16+8,y*16+8);
  const position=()=>page.evaluate(()=>[G.state.mapId,G.state.player.x,G.state.player.y]);
  // Controlled earned-chapter checkpoints isolate navigation. Combat and
  // chapter earnings are covered separately by native integration tests.
  await page.evaluate(()=>{
   G.state.opening=G.normalizeOpening({started:true,notice:true,cart:true});
   G.state.opening.defeated=G.state.enemies.filter(e=>e.openingKey).map(e=>e.openingKey);
   G.state.claimedForms=['rat','knight'];G.state.enemies=[];G.setForm('rat');
   Object.assign(G.state.player,{x:27*16+8,y:24*16+8,invuln:999});
  });await drain();await frames(20);await shot('culvert-mouth');
  const mouth=await position();await next();await drain();assert.deepEqual(await position(),mouth);
  assert.equal(await page.evaluate(()=>G.state.opening.sluice),false);
  await point(30,24);assert.equal(await page.evaluate(()=>G.smallPassageAt(G.state.player.x,G.state.player.y)),true);
  await page.evaluate(()=>G.setForm('knight'));assert.equal(await page.evaluate(()=>G.state.formId),'rat');await shot('culvert-inside');await reload();
  assert.equal(await page.evaluate(()=>G.state.formId),'rat');assert.equal(await page.evaluate(()=>G.smallPassageAt(G.state.player.x,G.state.player.y)),true);
  await point(34,24);const bank=await position();await next();await drain();assert.deepEqual(await position(),bank);
  assert.equal(await page.evaluate(()=>G.state.opening.sluice),true);await shot('sluice-open');
  await page.evaluate(()=>G.setForm('knight'));await point(27,24);assert.equal(await page.evaluate(()=>G.state.formId),'knight');await shot('bridge-return');
  // Enter the earned departure checkpoint, then walk every remaining road.
  await page.evaluate(()=>{
   G.state.opening.complete=true;G.state.delivery=G.makeDelivery();G.state.items=['orchard-ribbon'];
   Object.assign(G.state.player,{x:26*16+8,y:37*16+8});
  });await drain();await frames(20);const cart=await position();await next();await drain();assert.deepEqual(await position(),cart);
  assert.equal(await page.evaluate(()=>G.state.delivery.started),true);await shot('parcel-road-plan');
  assert.equal(await page.evaluate(()=>G.localJourneyRoutes().find(r=>r.map==='lanternReach').x),63);
  await point(60,37);await shot('east-road');await point(61,37);
  async function crossing(destination,dx,dy,label){
   const from=await page.evaluate(()=>G.state.mapId),key=dx?(dx>0?'ArrowRight':'ArrowLeft'):(dy>0?'ArrowDown':'ArrowUp');
   if(mode==='controller')await page.evaluate(({dx,dy})=>window.__nqTvPad(JSON.stringify({t:'s',a:[dx,dy,0,0],b:Array(16).fill(0)})),{dx,dy});
   else await page.keyboard.down(key);
   for(let i=0;i<100&&await page.evaluate(()=>G.state.mapId)===from;i++)await frames(1);
   if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
   else await page.keyboard.up(key);
   assert.equal(await page.evaluate(()=>G.state.mapId),destination);
   assert.equal(await page.evaluate(()=>!!G.state.zoneTransition),true,'walking uses the native directional scene transition');
   await frames(3);await shot(label+'-pan');await frames(20);await drain();await frames(20);
   assert.equal(await page.evaluate(()=>G.world.isSafeSpawn(G.state.player.x,G.state.player.y)),true);await shot(label);
  }
  await crossing('lanternReach',1,0,'lantern-arrival');
  await point(12,29);await point(16,29);await point(20,30);await page.evaluate(()=>G.setForm('rat'));await drain();
  await shot('recipe-mouth');const drainMouth=await position();await next();await drain();assert.deepEqual(await position(),drainMouth);
  await point(20,31);await shot('recipe-inside');await reload();
  assert.equal(await page.evaluate(()=>G.smallPassageAt(G.state.player.x,G.state.player.y)),true);
  await point(20,33);assert.equal(await page.evaluate(()=>G.state.delivery.salvage),true);
  assert.ok(await page.evaluate(()=>!!G.groundRewardFor('brindles-recipes')));await shot('recipe-ground');
  const spirit=await page.evaluate(()=>G.ensureTown().spirit);await point(20,30);await reload();await shot('recipe-bank-restored');
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),spirit);await point(20,33);await walkGift('brindles-recipes');
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),spirit+3);await shot('recipe-collected');await point(20,30);
  // Native waves/keeper were already verified in delivery.test.js. This
  // earned fixture opens their gates for an uninterrupted walking review.
  await page.evaluate(()=>{G.state.delivery.lamps=[2,2];G.state.delivery.keeper=true;G.state.enemies=[];});
  await point(16,29);await point(16,18);await point(26,18);await point(33,14);await point(39,14);await point(43,18);await point(57,18);
  await crossing('tollCourt',1,0,'bridge-arrival');await point(31,17);await crossing('sunriseQuay',1,0,'quay-arrival');
  await point(41,19);await crossing('town',1,0,'town-arrival');await point(2,8);await crossing('sunriseQuay',-1,0,'quay-return');
  await point(2,19);await crossing('tollCourt',-1,0,'bridge-return-road');await point(2,17);await crossing('lanternReach',-1,0,'lantern-return');
  await point(43,18);await point(39,14);await point(33,14);await point(26,18);await point(16,18);await point(16,29);await point(2,29);
  await crossing('orchardRoad',-1,0,'orchard-return');await point(26,37);await reload();await shot('road-home-restored');
  assert.equal(await page.evaluate(()=>G.state.delivery.lamps.join(',')),'2,2');assert.equal(await page.evaluate(()=>G.state.delivery.keeper),true);
  assert.equal(await page.evaluate(()=>G.state.items.includes('brindles-recipes')),true);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),spirit+3);
  assert.equal(await page.evaluate(()=>G.journeyTravelLinks().length),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
