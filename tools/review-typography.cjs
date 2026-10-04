#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
const base=path.resolve(process.argv[3]||'/tmp/nobodys-quest-typography-scenes');
async function scenario({page,hd,frames,next,drain,shot}){
 await page.evaluate(hd=>{
  G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=24;
  G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
  Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});G.setForm('rat');G.setHdPilot(hd);G.world.load('sunstepPrairie');G.state.enemies=[];Object.assign(G.state.player,{x:184,y:280,invuln:999});
 },hd);await drain();await page.evaluate(()=>document.fonts.ready);await frames(150);await drain();await frames(1);
 assert.ok(await page.evaluate(()=>[...document.fonts].some(f=>f.family==='Nunito'&&f.status==='loaded')),'bundled rounded font is actually loaded');
 assert.ok(await page.evaluate(()=>document.getElementById('ui').width>document.getElementById('game').width),'letters retain native screen density in both art settings');
 assert.deepEqual(await page.evaluate(()=>window.reviewPixelText),[],'world signs and combat labels do not paint into the pixel canvas');
 assert.ok(await page.evaluate(()=>window.reviewPaint.some(p=>p.text==='COURIER'&&p.font.includes('Nunito'))),'the native world sign paints on the sharp canvas');await shot('world');
 await page.evaluate(()=>{
  G.world.load('moleTrial');const e=G.state.enemies.find(e=>e.id==='moleMonarch');e.bossEngaged=true;
  Object.assign(G.state.player,G.world.safeArrival(e.x-64,e.y+40),{invuln:999});
 });await drain();await frames(20);await page.evaluate(()=>resolveBossAction(G.state.enemies.find(e=>e.id==='moleMonarch'),G.state.player,'royalStomp'));await frames(1);
 const combat=await page.evaluate(()=>window.reviewPaint);
 assert.ok(combat.some(p=>p.text==='MOVE OUT'&&p.font.includes('Nunito')),'the native combat pattern paints a sharp readable warning');
 await shot('combat');
 const text='The recipes made it home! Every cinnamon knot has a little thumbprint, and the slightly enormous one is for you. Follow the bank as Rat, keep the book dry, and come back hungry. We have a warm tray ready for the next traveller, too. Small paws can make a very big difference.';
 for(const [map,stage]of [['sunstepPrairie','standard-dialogue'],['sunriseQuay','paper-dialogue']]){
  await page.evaluate(({map,text})=>{G.world.load(map);G.state.enemies=[];G.ui.dialogue('BRINDLE',text);},{map,text});await frames(200);
  const paint=await page.evaluate(()=>window.reviewPaint);assert.ok(paint.some(p=>p.text.includes('Small paws')),'full dialogue reaches its final line');
  assert.ok(paint.every(p=>p.font.includes('Nunito')),'all painted lettering uses the readable family');
  assert.ok(paint.filter(p=>p.text.includes('recipes')||p.text.includes('Small paws')).every(p=>p.y>=0&&p.y<170),'dialogue lines stay inside the visible game');await shot(stage);await drain();
 }
 await page.evaluate(()=>G.ui.openMenu());
 for(const [route,stage]of [['field','journal'],['forms','build'],['map','atlas'],['town','home']]){
  const button=page.locator(`#menu [data-menu-route="${route}"]`).first();if(await button.count())await button.click();await frames(3);
  assert.ok(await page.locator('#menu').evaluate(el=>getComputedStyle(el).fontFamily.includes('Nunito')));
  assert.equal(await page.locator('#menu').evaluate(el=>el.scrollWidth>el.clientWidth),false,'larger lettering keeps the journal within the viewport');await shot(stage);
  if(stage==='build'){
   assert.ok(await page.locator('.form-lab-tabs button').evaluateAll(buttons=>buttons.every(b=>b.scrollWidth<=b.clientWidth)),'all form tabs fit their readable labels');
   assert.ok(await page.locator('.portrait-status').evaluateAll(labels=>labels.every(el=>el.scrollWidth<=el.clientWidth)),'form status labels fit without clipping');
   if(page.viewportSize().width>=700)assert.ok(await page.locator('.form-lab-header > div:first-child').evaluate(el=>el.getBoundingClientRect().width>=200),'the Form Lab introduction retains a readable line length');
  }
 }
 await page.evaluate(()=>G.ui.closeMenu());await page.evaluate(()=>G.showSaveSlotScreen(true));await frames(3);
 assert.ok(await page.locator('.title-lockup h1').evaluate(el=>getComputedStyle(el).fontFamily.includes('Nunito')));await shot('title');
 const back=page.locator('[data-title-return]');assert.ok(await back.count());await back.click();await frames(3);
 await page.evaluate(()=>G.showStoryEnding());await frames(3);const button=page.locator('[data-ending-close]'),bounds=await button.boundingBox(),viewport=page.viewportSize();assert.ok(bounds&&bounds.y>=0&&bounds.y+bounds.height<=viewport.height,'ending return remains visible with the readable font');await shot('ending');await button.click();await frames(3);
}
(async()=>{
 const common={url:process.argv[2],name:'Readable Nunito menus, dialogue, sharp world signs, title and ending',run:scenario,dpr:2};
 await review({...common,out:base});
 await review({...common,out:base+'-tablet',modes:['touch'],viewports:{touch:{width:768,height:1024}}});
})().catch(e=>{console.error(e);process.exitCode=1;});
