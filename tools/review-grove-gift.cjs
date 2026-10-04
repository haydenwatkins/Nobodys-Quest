#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:path.resolve(process.argv[3]||'/tmp/nobodys-quest-grove-scenes'),name:'Grove native seed collection, shelter restoration, saved keepsake and once-only spirit',
 run:async({page,hd,frames,next,drain,walkGift,walkTo,visibleGift,shot,reload})=>{
  await page.evaluate(hd=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=5;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});
   G.setForm('rat');G.setHdPilot(hd);G.world.load('whispering-grove');G.state.enemies=[];G.state.npcs=[];Object.assign(G.state.player,{x:88,y:232,invuln:999});
  },hd);await drain();await frames(80);await drain();
  // Authored checkpoints isolate stations and the actual rebuilt crossing.
  // Native input, collision, pickup and save boot handle their consequences.
  await next();await frames(80);await shot('denied');await drain();assert.equal(await page.evaluate(()=>G.groveSurvey().planted),false);
  await page.evaluate(()=>{const box=G.state.chests.find(c=>c.chest.item==='whispering-seed');Object.assign(G.state.player,{x:box.x*16+8,y:box.y*16+8});});await frames(1);await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.groveSurvey().seed),false);await visibleGift('whispering-seed');await shot('seed-ground');await walkGift('whispering-seed');assert.equal(await page.evaluate(()=>G.groveSurvey().seed),true);await frames(20);await shot('seed-collected');
  await page.evaluate(()=>Object.assign(G.state.player,{x:88,y:232,damageTaken:2,mana:0}));await frames(1);assert.equal(await page.evaluate(()=>G.world.solid(232,136)),true);await next();
  assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);assert.equal(await page.evaluate(()=>G.state.player.mana===G.playerMaxMana()),true);await frames(80);await shot('planting');await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.groveSurvey().pending),true);assert.equal(await page.evaluate(()=>G.world.solid(232,136)),false);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);
  await visibleGift('grove-home-tree');await shot('ground');await page.evaluate(()=>G.ui.openMenu());assert.ok((await page.locator('#menu').innerText()).includes('Your Shelter Keepsake waits beside the tree'));await page.locator('.journey-road').filter({hasText:'SOMEWHERE TO RETURN'}).scrollIntoViewIfNeeded();await shot('journal');await page.evaluate(()=>G.ui.closeMenu());
  await page.evaluate(()=>Object.assign(G.state.player,{x:216,y:136}));await frames(1);await walkTo(248,136);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);await shot('crossing');
  await page.evaluate(()=>Object.assign(G.state.player,{x:88,y:232}));const gift=await page.evaluate(()=>({...G.groundRewardFor('grove-home-tree')}));await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});
  assert.equal(await page.evaluate(()=>G.groundRewardFor('grove-home-tree').y),gift.y);assert.equal(await page.evaluate(()=>G.groveSurvey().planted),true);assert.equal(await page.evaluate(()=>G.world.solid(232,136)),false);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);
  await visibleGift('grove-home-tree');await shot('restored');await walkGift('grove-home-tree');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),26);await frames(20);await shot('collected');
  assert.equal(await page.evaluate(()=>G.groveSurvey().pending),false);await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(()=>G.ensureTown().spirit),26);assert.equal(await page.evaluate(()=>G.state.items.filter(i=>i==='grove-home-tree').length),1);assert.equal(await page.evaluate(()=>G.world.solid(232,136)),false);await shot('owned-boot');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
