#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:path.resolve(process.argv[3]||'/tmp/nobodys-quest-recipe-scenes'),name:'Brindle recipe promise: accept, Rat entry/re-entry, saved book, movement claim, native thanks and revisit',
 run:async({page,hd,frames,next,drain,offer,answer,walkGift,visibleGift,shot,reload})=>{
  await page.evaluate(hd=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});
   G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=5;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20,requests:[],followedRequest:null});G.setForm('rat');G.setHdPilot(hd);G.world.load('sunriseQuay');
   Object.assign(G.state.player,{x:12*16+8,y:12*16+8,damageTaken:0,invuln:999});
  },hd);await drain();await frames(100);await drain();await offer();await shot('offer');await answer(true);
  assert.equal(await page.evaluate(()=>G.currentTask().requestId),'recipes');assert.equal(await page.evaluate(()=>G.currentTask().ready),false);
  // Authored checkpoint positions isolate native drain/NPC interactions;
  // this fixture does not claim a complete walk from the quay to the bank.
  await page.evaluate(()=>{G.world.load('lanternReach');Object.assign(G.state.player,{x:18*16+8,y:30*16+8});});await drain();await frames(10);await next();await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.state.player.x),328);assert.equal(await page.evaluate(()=>G.currentTask().ready),false);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);
  assert.equal(await page.evaluate(()=>{
   const points=[],ctx=new Proxy({translate:(x,y)=>points.push([x,y])},{get:(o,k)=>k in o?o[k]:()=>{}}),gift=G.groundRewardFor('brindles-recipes');
   G.requestGuidance(true);G.drawWorldGuidance(ctx,{x:0,y:0},G.state.time);
   return points.some(([x,y])=>x===Math.floor(gift.x/16)*16+8&&y===Math.floor(gift.y/16)*16+6);
  }),true,'native breadcrumbs reach the recipe book tile');
  await visibleGift('brindles-recipes');await shot('ground');await next();await drain();
  assert.equal(await page.evaluate(()=>G.state.player.x),296);assert.equal(await page.evaluate(()=>G.recipeGiftApproach().point.join(',')),'18,30');
  assert.ok((await page.evaluate(()=>G.currentTask().objective)).includes('again'));await shot('bank-return');await reload();
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(()=>G.state.items.includes('brindles-recipes')),false);
  assert.ok((await page.evaluate(()=>G.deliveryCandidate().label)).includes('Return'));await next();await drain();await frames(50);await drain();await visibleGift('brindles-recipes');await shot('restored');
  await walkGift('brindles-recipes');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),23);assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Brindle');await shot('collected');
  await next();await drain();assert.equal(await page.evaluate(()=>G.state.player.x),296);
  await page.evaluate(()=>{G.world.load('sunriseQuay');Object.assign(G.state.player,{x:12*16+8,y:12*16+8});});await drain();await frames(10);await next();await frames(80);await shot('thanks');await drain();
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);assert.equal(await page.evaluate(()=>G.sunriseRequests().find(r=>r.id==='recipes').done),true);
  await frames(100);await drain();await shot('kept');await reload();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);assert.equal(await page.evaluate(()=>G.groundRewardFor('brindles-recipes')),null);
  await next();await frames(80);assert.ok((await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' '))).includes('generous thumb'));await shot('revisit');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
