#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:path.resolve(process.argv[3]||'/tmp/nobodys-quest-marsh-scenes'),name:'Marsh native sluices, Rat hatch, saved spirit gifts and collection',
 run:async({page,hd,frames,next,drain,walkGift,visibleGift,shot,reload})=>{
  await page.evaluate(hd=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});
   G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=5;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});
   G.setForm('nobody');G.setHdPilot(hd);G.world.load('sunkenMarsh');G.state.enemies=[];G.state.npcs=[];
   Object.assign(G.state.player,{x:248,y:56,damageTaken:0,invuln:999});
  },hd);await drain();await frames(80);await drain();
  // Isolate authored stations; real input handles interactions and collection.
  // Combat and wandering residents are removed to isolate the lettering and
  // station art. Native ward behavior is exercised by the simulation tests.
  for(const [item,y,sluices,stage]of [['marsh-north-sluice',56,1,'north-ground'],['marsh-south-sluice',248,2,'south-ground']]){
   await page.evaluate(y=>Object.assign(G.state.player,{x:248,y}),y);await frames(1);await next();await drain();await frames(80);await drain();
   assert.equal(await page.evaluate(()=>G.marshSurvey().sluices),sluices);
   assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(item=>G.state.items.includes(item),item),false);
   await visibleGift(item);await shot(stage);
  }
  await page.evaluate(()=>G.ui.openMenu());const journal=await page.locator('#menu').innerText();
  assert.ok(journal.includes('2/2 sluices open'));assert.ok(journal.includes('2 waterway bundles wait'));await page.locator('.journey-road').filter({hasText:'THE OLD FERRY MARSH'}).scrollIntoViewIfNeeded();await shot('journal');await page.evaluate(()=>G.ui.closeMenu());
  const south=await page.evaluate(()=>({...G.groundRewardFor('marsh-south-sluice')}));await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});
  assert.equal(await page.evaluate(()=>G.marshSurvey().sluices),2);
  assert.equal(await page.evaluate(()=>G.groundRewardFor('marsh-south-sluice').y),south.y);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);
  await visibleGift('marsh-south-sluice');await shot('restored');await walkGift('marsh-south-sluice');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),22);await frames(25);await shot('south-collected');
  await page.evaluate(()=>Object.assign(G.state.player,{x:248,y:56}));await frames(1);await walkGift('marsh-north-sluice');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),24);await frames(25);await shot('north-collected');
  await page.evaluate(()=>{G.state.enemies=[];G.state.bossHazards=[];G.state.projectiles=[];Object.assign(G.state.player,{x:56,y:56});});await frames(1);await next();await frames(80);await shot('hatch-denied');await drain();
  assert.equal(await page.evaluate(()=>G.marshSurvey().salvage),false);
  await page.evaluate(()=>G.setForm('rat'));await frames(1);await next();await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),24);assert.equal(await page.evaluate(()=>G.marshSurvey().salvagePending),true);await visibleGift('marsh-ferry-token');await shot('token-ground');
  await page.evaluate(()=>G.ui.openMenu());assert.ok((await page.locator('#menu').innerText()).includes('Old Ferry Token waits beside the wreck'));await page.locator('.journey-road').filter({hasText:'THE OLD FERRY MARSH'}).scrollIntoViewIfNeeded();await shot('token-journal');await page.evaluate(()=>G.ui.closeMenu());
  await page.evaluate(()=>Object.assign(G.state.player,{x:248,y:56}));await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(()=>G.ensureTown().spirit),24);assert.equal(await page.evaluate(()=>G.marshSurvey().sluices),2);
  await page.evaluate(()=>{G.state.enemies=[];Object.assign(G.state.player,{x:56,y:56});});await frames(1);await visibleGift('marsh-ferry-token');await shot('token-restored');await walkGift('marsh-ferry-token');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),30);await frames(25);await shot('token-collected');
  await page.evaluate(()=>Object.assign(G.state.player,{x:248,y:56}));await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(()=>G.ensureTown().spirit),30);assert.equal(await page.evaluate(()=>G.state.groundRewards.length),0);
  assert.equal(await page.evaluate(()=>G.state.items.filter(id=>id.startsWith('marsh-')).length),3);assert.equal(await page.evaluate(()=>G.marshSurvey().sluices),2);await shot('owned-boot');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
