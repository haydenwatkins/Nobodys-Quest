#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
const out=process.argv[3]||'/tmp/nq-menu-optional-review';
async function choose({page,mode,frames,pad},selector){
 if(mode==='touch'){await page.locator(selector).tap();await frames(4);return;}
 const target=await page.locator(selector).boundingBox();assert.ok(target);
 // Move actual controller focus with D-pad; no synthetic click or focus grant.
 for(let i=0;i<15;i++){
  const current=await page.locator('#field-kit .controller-focus').boundingBox();assert.ok(current);
  if(Math.abs(current.x-target.x)<2&&Math.abs(current.y-target.y)<2){await pad(0);return;}
  if(Math.abs(current.y-target.y)>30)await pad(current.y>target.y?12:13);else await pad(current.x>target.x?14:15);
 }
 throw Error(`controller cannot reach ${selector}`);
}
async function fit(page){
 assert.equal(await page.evaluate(()=>{
  const panel=document.querySelector('.field-kit-panel'),buttons=[...document.querySelectorAll('#field-kit button')];
  const r=panel.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&panel.scrollWidth<=panel.clientWidth&&buttons.every(b=>{const s=getComputedStyle(b);return s.textOverflow!=='ellipsis';});
 }),true,'kit fits the device, has no horizontal overflow or ellipsis');
}
review({url:process.argv[2],out,name:'menu-optional lanterns and treasures',publishedHost:true,
 modes:process.argv.includes('--tv')?['controller']:process.argv.includes('--tablet')?['touch']:undefined,
 viewports:process.argv.includes('--tablet')?{touch:process.argv.includes('--portrait')?{width:768,height:1024}:{width:1024,height:768}}:{},
 async onLanternIntro(ctx){const {page,shot}=ctx;
  assert.equal(await page.evaluate(()=>G.ui.menuOpen),false);assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);
  await fit(page);await shot('first-lantern-invitation');const before=await page.evaluate(()=>JSON.stringify({items:G.state.items,quests:G.questsDone,stars:G.state.stars}));
  await choose(ctx,'[data-lamp="easyMode"]');assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),true);await shot('heart-lantern-lit');
  await choose(ctx,'[data-lamp="bossAssistance"]');assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),true);await shot('both-lanterns-lit');
  assert.equal(await page.evaluate(()=>JSON.stringify({items:G.state.items,quests:G.questsDone,stars:G.state.stars})),before);
 },
 async run(ctx){const {page,mode,frames,pad,next,drain,walkTo,shot,reload}=ctx;
  assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);assert.equal(await page.evaluate(()=>G.state.opening.seen.includes('help-lanterns')),true);
  // Walk from the genuine new-game arrival to Pebble's physical lamps.
  await walkTo(6*16+8,38*16+8);assert.equal(await page.evaluate(()=>G.helpStationCandidate()?.kind),'easyMode');await shot('opening-world-lights');
  await next();assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),false);
  await walkTo(8*16+8,38*16+8);await next();assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);
  assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);await shot('opening-world-unlit');await reload();
  assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);
  // Controlled collected-treasure checkpoint. Ownership is supplied; carrying,
  // browsing, native controls, save/reboot and real effect costs are exercised.
  await page.evaluate(()=>{
   G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms=['rat','knight'];
   G.state.items.push('trophy-heartwood-crown','trophy-eclipse-sigil','orchard-ribbon');G.world.load('sunriseQuay');G.state.enemies=[];G.state.projectiles=[];G.setForm('knight');
   const bag=G.helpStations().find(s=>s.kind==='pockets');G.state.player.x=bag.x;G.state.player.y=bag.y;G.state.player.mana=3;
  });await drain();await frames(10);await shot('quay-camp-kit');await next();assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),true);await fit(page);await shot('pocket-crown');
  assert.equal(await page.evaluate(()=>G.activeKeepsake()),null);const mana=await page.evaluate(()=>G.state.player.mana);
  await choose(ctx,'[data-pocket-page="1"]');await shot('pocket-sigil-preview');assert.equal(await page.evaluate(()=>G.activeKeepsake()),null);assert.equal(await page.evaluate(()=>G.state.player.mana),mana);
  await choose(ctx,'[data-pocket-carry]');assert.equal(await page.evaluate(()=>G.activeKeepsake()?.id),'eclipse');assert.equal(await page.evaluate(()=>G.state.player.mana),mana);assert.equal(await page.evaluate(()=>G.ui.menuOpen||G.fieldKit.isOpen()),false);
  await reload();assert.equal(await page.evaluate(()=>G.activeKeepsake()?.id),'eclipse');await frames(10);
  // Quick Mix is the existing on-screen entry: R3 or a real held touch B.
  if(mode==='controller')await pad(11);else{
   const b=await page.locator('#btn-b').boundingBox(),cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2}]});
   await page.waitForTimeout(650);await frames(1);
   await shot('held-mixer');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frames(4);await cdp.detach();
  }
  assert.equal(await page.evaluate(()=>G.ui.artMixerOpen),true,JSON.stringify(await page.evaluate(()=>({touch:G.input.isTouch,form:G.state.formId,slots:G.playerForm().slots,mix:G.systemIntroduced('mix'),kit:G.fieldKit.isOpen(),dialogue:G.ui.dialogueOpen,menu:G.ui.menuOpen,held:document.getElementById('btn-b').className,history:window.reviewPaint.map(p=>p.text)}))));await shot('quick-mix-pockets-entry');
  if(mode==='touch'){await page.locator('[data-mix-pockets]').tap();await frames(4);}else{
   // Starts on the equipped art. Up to the slot row, then right to Pockets.
   for(let i=0;i<12;i++){if(await page.locator('[data-mix-pockets]').evaluate(b=>b.classList.contains('controller-focus')))break;const f=await page.locator('#art-mixer .controller-focus').boundingBox(),t=await page.locator('[data-mix-pockets]').boundingBox();await pad(f.y>t.y+20?12:f.x<t.x?15:14);}
   assert.equal(await page.locator('[data-mix-pockets]').evaluate(b=>b.classList.contains('controller-focus')),true);await pad(0);
  }
  assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),true);await fit(page);await shot('pockets-carried-after-reboot');
  // Inspect exact values through a focusable, native disclosure on TV as well.
  await choose(ctx,'[data-nav-id="pocket-detail"]');assert.equal(await page.locator('#field-kit details').evaluate(d=>d.open),true);await shot('pockets-exact-gift-price');
  await choose(ctx,'[data-pocket-carry]');assert.equal(await page.evaluate(()=>G.activeKeepsake()),null);assert.equal(await page.evaluate(()=>G.ui.menuOpen||G.fieldKit.isOpen()),false);
  // Souvenirs have no Equip button, and cannot claim the already-earned reward.
  await page.evaluate(()=>{const bag=G.helpStations().find(s=>s.kind==='pockets');G.state.player.x=bag.x;G.state.player.y=bag.y;});await next();await choose(ctx,'[data-pocket-page="1"]');await choose(ctx,'[data-pocket-page="1"]');await shot('pocket-souvenir');assert.equal(await page.locator('[data-pocket-carry]').count(),0);
  if(mode==='touch'){await page.locator('[data-kit-close]').tap();await frames(4);}else await pad(1);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
