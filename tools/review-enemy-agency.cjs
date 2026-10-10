#!/usr/bin/env node
'use strict';
// Controlled collected gift / encounter checkpoint, using actual world
// objects, native touch stick or TV bridge, casts, collision and field UI.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
async function choose({page,mode,frames,pad},selector){
 if(mode==='touch'){await page.locator(selector).tap();await frames(1);return;}
 for(let i=0;i<15;i++){
  if(await page.locator(selector).evaluate(b=>b.classList.contains('controller-focus'))){await pad(0);return;}
  const current=await page.locator('#field-kit .controller-focus').boundingBox(),target=await page.locator(selector).boundingBox();
  assert.ok(current&&target);
  await pad(Math.abs(current.y-target.y)>30?(current.y>target.y?12:13):(current.x>target.x?14:15));
 }
 throw Error(`controller cannot reach ${selector}`);
}
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-enemy-agency',name:'enemy agency',publishedHost:true,
 async run(ctx){
  const {page,mode,frames,next,drain,shot,pad}=ctx;
  await page.evaluate(()=>{
   G.state.opening.complete=true;G.state.delivery.complete=true;G.state.items.push('trophy-heartwood-crown');
   G.world.load('sunriseQuay');G.state.enemies=[];G.setForm('nobody');
   const bag=G.helpStations().find(s=>s.kind==='pockets');Object.assign(G.state.player,{x:bag.x,y:bag.y,mana:0,manaRegenDelay:100});
  });await drain();await frames(2);await next();
  assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),true);
  assert.ok((await page.locator('#field-kit').innerText()).includes('Swings push foes less'));
  await shot('crown-field-preview');await choose(ctx,'[data-nav-id="pocket-detail"]');
  assert.equal(await page.locator('#field-kit details').evaluate(d=>d.open),true);
  assert.ok((await page.locator('#field-kit').innerText()).includes('Melee hits push foes 40% less.'));
  await page.waitForFunction(()=>{
   const r=document.querySelector('#field-kit details p').getBoundingClientRect();
   return r.top>=0&&r.bottom<=innerHeight;
  },null,{polling:50,timeout:2000});
  await shot('crown-exact-tradeoff');await choose(ctx,'[data-pocket-carry]');
  assert.equal(await page.evaluate(()=>G.activeKeepsake()?.id),'heartwood');
  assert.equal(await page.evaluate(()=>G.state.player.mana),0);
  assert.equal(await page.evaluate(()=>G.loadSaveData().keepsakeId),'heartwood');
  await page.evaluate(()=>G.world.load('orchardRoad'));await frames(20);await drain();
  await page.evaluate(()=>{
   const e=G.state.enemies.find(e=>e.id==='orchardSpitter');window.reviewCaster=e;
   G.state.enemies=[e];G.state.projectiles=[];G.state.bossCutscene=null;
   e.shootT=0;
   Object.assign(G.state.player,{x:e.x-70,y:e.y,dir:{x:1,y:0},damageTaken:0,invuln:0,cooldowns:{},mana:0,manaRegenDelay:100});
  });await frames(3);await drain();
  await page.evaluate(()=>{G.state.projectiles=[];window.reviewCaster.shootT=0;});await frames(1);
  assert.equal(await page.evaluate(()=>typeof G.drawEnemyShotWarnings),'undefined');
  assert.ok(await page.evaluate(()=>G.state.projectiles.some(pr=>pr.owner===window.reviewCaster)),'native firing beat releases immediately');
  assert.equal(await page.evaluate(()=>window.reviewCaster.shotTell),undefined);
  await shot('visible-shot-without-aim-lane');
  const target=await page.evaluate(()=>({x:G.state.player.x,y:G.state.player.y}));
  let cdp;
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,1,0,0],b:Array(16).fill(0)})));
  else{const zone=await page.locator('#joy-zone').boundingBox(),x=zone.x+zone.width/2,y=zone.y+zone.height/2;cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+42}]});}
  await frames(8);
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
  else{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  assert.ok(await page.evaluate(target=>G.state.player.y-target.y>=25,target),'native movement avoids the visible released shot');
  await shot('visible-shot-native-sidestep');let crossed=false;
  for(let i=0;i<28;i++){await frames(1);crossed ||= await page.evaluate(target=>G.state.projectiles.some(pr=>pr.owner===window.reviewCaster&&Math.hypot(pr.x-target.x,pr.y-target.y)<9),target);}
  assert.ok(crossed,'the actual shot reaches the old position');assert.equal(await page.evaluate(()=>G.state.player.damageTaken),0);
  await page.evaluate(()=>{const e=window.reviewCaster;e.shootT=1;Object.assign(G.state.player,{x:e.x-19,y:e.y,dir:{x:1,y:0},cooldowns:{},mana:0,manaRegenDelay:100});});await next();
  assert.equal(await page.evaluate(()=>window.reviewCaster.hp),3);assert.ok(await page.evaluate(()=>G.state.player.mana>0));await shot('ordinary-native-free-hit');
  // Authored shot silhouettes keep their identity under the shared contrast.
  await page.evaluate(()=>{const e=window.reviewCaster;G.state.projectiles=['riftBlade','card','pie','fault','shell','star','seed','wave'].map((shape,i)=>({x:G.state.player.x+16+(i%4)*14,y:G.state.player.y-25-Math.floor(i/4)*18,vx:0,vy:0,size:3,color:'#8153c1',shape,fromPlayer:false,owner:e,range:140,startX:G.state.player.x,startY:G.state.player.y,damage:1}));});await frames(1);await shot('hostile-shot-silhouettes');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
