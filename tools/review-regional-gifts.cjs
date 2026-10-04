#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
const regions={ridge:{map:'emberRidge',item:'ridge-coal-watch',point:[10,4],heading:'THE LAST WATCH',amount:3},
 mistwood:{map:'mistwood',item:'mistwood-middle-road',point:[7,13],heading:'THE THREE TRAIL BELLS',amount:6},
 starfall:{map:'starfallRuins',item:'starfall-thread',point:[15,15],heading:'THE LOST OBSERVATORY',amount:8},
 glasswater:{map:'glasswaterDesert',item:'glasswater-meridian',point:[23,6],heading:'THE TRUE MERIDIAN',amount:6}};
const region=process.argv[2],spec=regions[region];assert.ok(spec,'choose ridge, mistwood, starfall or glasswater');
review({url:process.argv[3],out:path.resolve(process.argv[4]||`/tmp/nobodys-quest-${region}-gift-scenes`),name:`${region}: native regional actions, saved gift, collection and consumers`,
 run:async({page,hd,frames,next,drain,walkGift,walkTo,visibleGift,shot,reload})=>{
  await page.evaluate(({hd,map,point})=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=40;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});G.setForm('nobody');G.setHdPilot(hd);G.world.load(map);G.state.enemies=[];G.state.npcs=[];
   Object.assign(G.state.player,{x:point[0]*16+8,y:point[1]*16+8,invuln:999});
  },{hd,...spec});await drain();await page.evaluate(()=>document.fonts.ready);await frames(80);await drain();
  const at=async(point)=>{await page.evaluate(point=>Object.assign(G.state.player,{x:point[0]*16+8,y:point[1]*16+8}),point);await frames(1);};
  async function watchfire(point,stage){
   await at(point);await next();assert.equal(await page.evaluate(()=>G.ridgeSurvey().active.remaining),2);await shot(stage+'-fight');
   await page.evaluate(()=>{window.reviewGuards=[...G.state.enemies];});
   // Controlled final blows retain each spawned guard's native ward type.
   // Stage one guard at a time; this is not a balanced complete encounter.
   for(let i=0;i<2;i++){
    // Isolate the Shade's final blows on open floor: ridge rock correctly
    // blocks projectiles fired directly beneath the wall at its spawn.
    await page.evaluate(i=>{const e=window.reviewGuards[i];G.state.enemies=[e];if(e.id==='shade')e.y=14*16+8;e.hp=1;if(e.ward)e.ward.hp=1;G.setForm(e.id==='brute'?'knight':e.id==='shade'?'wizard':'nobody');Object.assign(G.state.player,{x:e.x+14,y:e.y,dir:{x:-1,y:0},invuln:999,damageTaken:2,mana:G.playerMaxMana()});},i);
    for(let tries=0;tries<6&&!await page.evaluate(i=>window.reviewGuards[i].dead,i);tries++){await next();await frames(25);await drain();}
    const outcome=await page.evaluate(i=>{const e=window.reviewGuards[i],p=G.state.player;return {dead:e.dead,id:e.id,hp:e.hp,ward:e.ward,x:e.x,y:e.y,form:G.state.formId,loadout:G.getLoadout(G.state.formId),player:{x:p.x,y:p.y,dir:p.dir}};},i);
    assert.ok(outcome.dead,`the real basic art breaks the matching ward and defeats the guard: ${JSON.stringify(outcome)}`);
    if(!i)assert.equal(await page.evaluate(()=>G.ridgeSurvey().active.remaining),1);
   }
   assert.equal(await page.evaluate(()=>G.ridgeSurvey().active),null);assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);assert.equal(await page.evaluate(()=>G.state.player.mana===G.playerMaxMana()),true);
   await at(point);await frames(80);await drain();
  }
  if(region==='ridge')await watchfire(spec.point,'coal');
  if(region==='mistwood')for(const p of [[23,5],[6,5],[7,13]]){await at(p);await next();await drain();}
  if(region==='starfall'){
   await next();await frames(80);await shot('not-ready');await drain();assert.equal(await page.evaluate(()=>G.starfallSurvey().instrument),false);
   for(const p of [[24,14],[24,5],[5,5],spec.point]){await at(p);await next();await drain();}
   assert.equal(await page.evaluate(()=>G.starfallSurvey().thread),false);assert.equal(await page.evaluate(()=>G.costumeUnlocked('starstrider')),false);
  }
  if(region==='glasswater'){
   await next();await frames(80);await shot('no-prism');await drain();assert.equal(await page.evaluate(()=>G.glasswaterSurvey().aligned),false);
   await page.evaluate(()=>{const box=G.state.chests.find(c=>c.chest.item==='glasswater-prism');Object.assign(G.state.player,{x:box.x*16+8,y:box.y*16+8});});await frames(1);await drain();await frames(80);await drain();await visibleGift('glasswater-prism');await shot('prism-ground');await walkGift('glasswater-prism');await at(spec.point);await next();await drain();
   assert.equal(await page.evaluate(()=>G.world.solid(376,312)),false);assert.ok((await page.evaluate(()=>G.world.portalBlockReason(G.state.grid[28][23]).text)).includes('Lantern Mark'));
  }
  await frames(80);await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),region==='ridge'?22:20);await visibleGift(spec.item);await shot('ground');
  await page.evaluate(()=>G.ui.openMenu());const card=page.locator('.journey-road').filter({hasText:spec.heading});await card.scrollIntoViewIfNeeded();assert.ok((await card.innerText()).includes(region==='ridge'?'lantern waits':region==='mistwood'?'Trail Bell Keepsake waits':region==='starfall'?'Fallen Star Thread waits':'Meridian Keepsake waits'));await shot('journal');await page.evaluate(()=>G.ui.closeMenu());
  if(region==='mistwood'){await page.evaluate(()=>Object.assign(G.state.player,{x:216,y:152}));await frames(1);await walkTo(248,152);await shot('crossing');await at(spec.point);}
  if(region==='glasswater'){await page.evaluate(()=>Object.assign(G.state.player,{x:376,y:296}));await frames(1);await walkTo(376,336);await shot('crossing');await at(spec.point);}
  const gift=await page.evaluate(item=>({...G.groundRewardFor(item)}),spec.item);await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});
  assert.equal(await page.evaluate(item=>G.groundRewardFor(item)?.y,spec.item),gift.y);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),region==='ridge'?22:20);await visibleGift(spec.item);await shot('restored');await walkGift(spec.item);
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),(region==='ridge'?22:20)+spec.amount);await frames(25);await shot('collected');
  if(region==='starfall')assert.equal(await page.evaluate(()=>G.costumeUnlocked('starstrider')),true);
  if(region==='ridge'){
   await page.evaluate(()=>{G.state.enemies=[];G.state.pickups=[];});await watchfire([14,14],'ash');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),27);await visibleGift('ridge-ash-watch');await shot('ash-ground');await walkGift('ridge-ash-watch');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),30);await frames(25);await shot('ash-collected');
  }
  await reload();await page.evaluate(()=>{G.state.enemies=[];G.state.npcs=[];});assert.equal(await page.evaluate(()=>G.ensureTown().spirit),region==='ridge'?30:20+spec.amount);assert.equal(await page.evaluate(()=>G.state.groundRewards.length),0);await shot('owned-boot');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
