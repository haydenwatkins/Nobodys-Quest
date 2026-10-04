#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
const item='shattercoast-tideglass-chronicle';
review({url:process.argv[2],out:path.resolve(process.argv[3]||'/tmp/nobodys-quest-chronicle-gift-scenes'),name:'Chronicle: native cairn, saved book, collection and later reading',
 run:async({page,hd,frames,next,drain,walkGift,visibleGift,shot,reload})=>{
  // Earned campaign prerequisites isolate presentation; this is not a replay
  // of the four full guardian encounters. Native action and collection follow.
  await page.evaluate(hd=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern','tide-shell','paper-crane','orrery-key'];G.state.stars=28;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});G.setForm('nobody');G.setHdPilot(hd);G.world.load('shattercoast');G.state.enemies=[];G.state.npcs=[];Object.assign(G.state.player,{x:424,y:168,invuln:999});
  },hd);await drain();await page.evaluate(()=>document.fonts.ready);await frames(80);await drain();
  await next();await frames(80);await shot('missing-lesson');assert.equal(await page.evaluate(()=>G.shattercoastChronicle().gathered),3);assert.equal(await page.evaluate(item=>G.groundRewardFor(item),item),null);await drain();
  await page.evaluate(()=>G.state.items.push('elder-acorn'));await next();await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.shattercoastChronicle().complete),true);assert.equal(await page.evaluate(item=>G.state.items.includes(item),item),false);assert.equal(await page.evaluate(()=>G.state.stars),28);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);await visibleGift(item);await shot('ground');
  await page.evaluate(()=>G.ui.openMenu());const card=page.locator('.journey-road').filter({hasText:'THE TIDEGLASS CHRONICLE'});await card.scrollIntoViewIfNeeded();assert.ok((await card.innerText()).includes('collect it for 1 star and 8 town spirit'));await shot('journal');await page.evaluate(()=>G.ui.closeMenu());
  await next();await frames(240);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('carry the four lessons home.')));await shot('pending-reading');await drain();
  const gift=await page.evaluate(item=>({...G.groundRewardFor(item)}),item);await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(item=>G.groundRewardFor(item).y,item),gift.y);assert.equal(await page.evaluate(()=>G.state.stars),28);await visibleGift(item);await shot('restored');
  await walkGift(item);assert.equal(await page.evaluate(()=>G.state.stars),29);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);assert.equal(await page.evaluate(()=>G.shattercoastChronicle().pending),false);await frames(25);await shot('collected');
  await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(()=>G.state.stars),29);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);assert.equal(await page.evaluate(()=>G.state.groundRewards.length),0);await shot('owned-boot');
  await page.evaluate(()=>Object.assign(G.state.player,{x:424,y:168}));await frames(1);await next();await frames(80);assert.ok(await page.evaluate(()=>G.ui.dialogueOpen));assert.equal(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('Your Chronicle waits')),false);await shot('later-reading');await drain();assert.equal(await page.evaluate(()=>G.state.stars),29);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),28);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
