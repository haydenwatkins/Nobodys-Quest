#!/usr/bin/env node
'use strict';
// Load only actual saved output from check-opening-to-mire-session.cjs.
// Native title, NPC choice, echo walking, field practice choice, road crossing,
// reward return and reload. No browser ownership or encounter grants.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),review=require('./lib/browser-review.cjs');
const checkpoints=process.argv[4]||'/tmp/nq-campaign-session';
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-campaign-preparation',name:'earned harbor preparation and direct home road',publishedHost:true,modes:process.env.REVIEW_MODE?[process.env.REVIEW_MODE]:['touch','controller'],
 async run({page,mode,hd,frames,next,drain,answer,walkTo,shot,reload,boot}){
  async function restore(label){const saved=JSON.parse(fs.readFileSync(path.join(checkpoints,label+'.json'),'utf8'));assert.equal(saved.opening.version,2);await page.evaluate(saved=>localStorage.setItem('nobodys-quest-save-v2-slot-1',JSON.stringify(saved)),saved);await page.reload();await boot();assert.equal(await page.evaluate(()=>G.hdPilot),hd);}
  assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);await shot('fresh-quiet-arrival');
  await restore('recipes-returned');assert.equal(await page.evaluate(()=>G.formReady('wizard')),true);assert.equal(await page.evaluate(()=>G.formUnlocked('wizard')),false);// Loading a ready save seeds a recovery echo. Remove only that transient
  // recovery to reproduce the uninterrupted journey's pre-choice state;
  // all checkpoint ownership, lessons, rewards and position remain earned.
  assert.equal(await page.evaluate(()=>G.formEchoFor('wizard')?.source),'legacy');
  await page.evaluate(()=>{G.state.formEchoes=G.state.formEchoes.filter(e=>e.formId!=='wizard');G.formEchoGuide=null;});
  await walkTo(22*16+8,20*16+8);await next();await frames(160);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('worried about the late boat')));await shot('pebble-worried');
  await next();await frames(140);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('Starwick')));await shot('magic-purpose');
  await next();await frames(150);const prose=await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' '));assert.ok(prose.includes('east road')&&prose.includes('Sunken Marsh'));assert.ok(!prose.includes('Parcel can take'));await shot('connected-directions');
  await next();await frames(6);assert.ok(await page.evaluate(()=>window.reviewPaint.some(p=>p.text.endsWith('Maybe later'))));await shot('deliberate-promise');
  const before=await page.evaluate(()=>JSON.stringify([G.state.stars,G.questsDone,G.questCounts,G.state.items,G.state.formId]));await answer(true);
  assert.equal(await page.evaluate(()=>G.formEchoFor('wizard')?.source),'promise');assert.equal(await page.evaluate(()=>JSON.stringify([G.state.stars,G.questsDone,G.questCounts,G.state.items,G.state.formId])),before);await shot('earned-magic-waits');
  await reload();assert.equal(await page.evaluate(()=>G.followedSunriseRequest()?.id),'beacon');const echo=await page.evaluate(()=>G.formEchoFor('wizard'));assert.equal(echo.source,'promise');
  await walkTo(echo.x,echo.y);await frames(4);await drain();assert.equal(await page.evaluate(()=>G.state.formId),'wizard');assert.equal(await page.evaluate(()=>G.formLevel('wizard')),1);await frames(110);await shot('magic-before-departure');
  // At a quiet road, the chosen task is full and automatic lesson text yields.
  await walkTo(28*16+8,20*16+8);await frames(140);assert.equal(await page.evaluate(()=>G.showFieldMastery()),false);assert.equal(await page.evaluate(()=>window.reviewPaint.some(p=>p.text.includes('MASTERY'))),false);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('Find the Mire')));await shot('one-chosen-promise');
  await restore('pearl-collected');assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Pebble');assert.equal(await page.evaluate(()=>G.showFieldMastery()),false);assert.deepEqual(await page.evaluate(()=>G.guidanceRoute('sunkenMarsh','sunriseQuay').steps.map(s=>s.to)),['overworld','town','sunriseQuay']);
  // Restore the earned journey's own first return waypoint, rather than
  // moving its player or loading a map directly in the browser.
  await restore('arrive-overworld');assert.equal(await page.evaluate(()=>G.state.mapId),'overworld');assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Pebble');await frames(90);await shot('return-road-guidance');
  await restore('home-road-approach');await frames(20);await shot('home-road-approach');
  await page.bringToFront();
  await page.waitForFunction(()=>document.hasFocus()&&!document.hidden,undefined,{polling:10});
  if(mode==='controller'){
   assert.equal(await page.evaluate(()=>G.input.tvPadActive),true);
   // The Android wrapper streams held state. Send fresh native packets as
   // we walk, rather than relying on one packet across browser focus events.
   for(let i=0;i<40&&await page.evaluate(()=>G.state.mapId)==='overworld';i++){
    await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,-1,0,0],b:Array(16).fill(0)})));await frames(1);
   }
   await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
  }else{
   const rect=await page.locator('#joy-zone').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
   const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-60}]});
   await page.waitForFunction(()=>G.input.vec.y<-.5,undefined,{polling:10,timeout:3000});
   for(let i=0;i<40&&await page.evaluate(()=>G.state.mapId)==='overworld';i++)await frames(1);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }
  // Let the real native release arrive before advancing the controlled RAF.
  await frames(1);await page.waitForFunction(()=>Math.hypot(G.input.vec.x,G.input.vec.y)<.08,undefined,{polling:10,timeout:3000});
  await frames(30);await drain();assert.equal(await page.evaluate(()=>G.state.mapId),'town');assert.equal(await page.evaluate(()=>G.showFieldMastery()),false);await shot('native-home-crossing');await reload();assert.equal(await page.evaluate(()=>G.state.mapId),'town');
  await restore('arrive-sunrisequay');await frames(100);assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Pebble');assert.equal(await page.evaluate(()=>window.reviewPaint.some(p=>p.text.includes('MASTERY'))),false);await shot('quiet-good-news-return');
  await walkTo(22*16+8,20*16+8);await next();await frames(180);await shot('pebble-good-news');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().requests.includes('beacon')),true);assert.ok(await page.evaluate(()=>G.groundRewardFor('sunrise-thanks-beacon')));await reload();assert.equal(await page.evaluate(()=>G.followedSunriseRequest()),null);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
