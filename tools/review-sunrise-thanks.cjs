#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
const sources={beacon:[22,20,8,'A light for the late boat'],recipes:[12,12,5,'The cinnamon pages'],dragon:[28,26,6,'A dragon needs a story'],welcome:[30,13,5,'Room for one more']};
const id=process.argv[2],spec=sources[id];assert.ok(spec,'choose beacon, recipes, dragon or welcome');const item=`sunrise-thanks-${id}`;
review({url:process.argv[3],out:path.resolve(process.argv[4]||`/tmp/nobodys-quest-thanks-${id}-scenes`),name:`${id}: native neighbour thanks, saved gift, collection and revisit`,
 run:async({page,hd,frames,next,drain,walkGift,visibleGift,shot,reload})=>{
  await page.evaluate(({hd,id,x,y})=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=28;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20,requests:[],followedRequest:null});
   // Earned accomplishments isolate the native return/thanks interaction.
   if(id==='beacon')G.state.items.push('trophy-mire-pearl');if(id==='recipes')G.state.items.push('brindles-recipes');if(id==='dragon')G.ensureExpeditionProgress().victories=1;if(id==='welcome')G.ensureTown().projects.welcomeLodge=true;
   G.setForm('nobody');G.setHdPilot(hd);G.world.load('sunriseQuay');G.state.enemies=[];G.followSunriseRequest(id);Object.assign(G.state.player,{x:x*16+8-18,y:y*16+8+10,invuln:999});
  },{hd,id,x:spec[0],y:spec[1]});await drain();await page.evaluate(()=>document.fonts.ready);await frames(80);await drain();
  assert.equal(await page.evaluate(()=>G.currentTask().kind),'request');await next();await frames(240);assert.ok(await page.evaluate(()=>G.ui.dialogueOpen));await shot('thanks');await drain();await frames(80);await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(id=>G.sunriseRequests().find(r=>r.id===id).done,id),true);assert.equal(await page.evaluate(()=>G.followedSunriseRequest()),null);await visibleGift(item);await shot('ground');
  await page.evaluate(()=>G.ui.openMenu());await page.locator('[data-menu-route="town"]').first().click();const card=page.locator('.sunrise-promise').filter({hasText:spec[3]});await card.scrollIntoViewIfNeeded();assert.ok((await card.innerText()).includes(`Waiting to collect: ${spec[2]} town spirit`));await shot('journal');await page.evaluate(()=>G.ui.closeMenu());
  const gift=await page.evaluate(item=>({...G.groundRewardFor(item)}),item);await reload();await page.evaluate(()=>G.state.enemies=[]);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(item=>G.groundRewardFor(item).y,item),gift.y);await visibleGift(item);await shot('restored');
  await walkGift(item);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20+spec[2]);assert.equal(await page.evaluate(id=>G.sunriseRequests().find(r=>r.id===id).pending,id),false);await frames(25);await shot('collected');
  await reload();await page.evaluate(()=>G.state.enemies=[]);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20+spec[2]);assert.equal(await page.evaluate(()=>G.state.groundRewards.length),0);await shot('owned-boot');
  await page.evaluate(({x,y})=>Object.assign(G.state.player,{x:x*16+8-18,y:y*16+8+10}),{x:spec[0],y:spec[1]});await frames(1);await next();await frames(240);assert.ok(await page.evaluate(()=>G.ui.dialogueOpen));assert.equal(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('waits beside me')),false);await shot('revisit');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20+spec[2]);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
