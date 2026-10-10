#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
(async()=>{for(const setup of ['standard','heart','guardian']){
 const expected={heart:setup==='heart',guardian:setup==='guardian'};
 await review({url:process.argv[2]||'https://quest-review.example/',out:(process.argv[3]||'/tmp/nq-quiet-lanterns')+'/'+setup,name:'quiet opening '+setup,publishedHost:true,
  ...(process.argv.includes('--tablet')?{modes:['touch'],viewports:{touch:{width:768,height:1024}}}:process.argv.includes('--small')?{modes:['touch'],viewports:{touch:{width:640,height:360}}}:{}),
  async run({page,frames,next,walkTo,shot,reload}){
   assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()||G.ui.menuOpen||G.ui.dialogueOpen),false);
   assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);
   assert.equal(await page.evaluate(()=>G.helpStationCandidate()),null,'no lamp action under the arriving player');
   await shot('uninterrupted-arrival');
   const before=await page.evaluate(()=>JSON.stringify({stars:G.state.stars,items:G.state.items,quests:G.questsDone}));
   const station=async key=>page.evaluate(key=>{const p=G.state.player;return G.helpStations().filter(s=>s.kind===key).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];},key);
   async function switchLamp(key){const at=await station(key);assert.ok(at);await walkTo(at.x,at.y);assert.equal(await page.evaluate(()=>G.helpStationCandidate()?.kind),key);await shot(key+'-world-prompt');await next();assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()||G.ui.menuOpen),false);}
   if(setup==='heart'){
    await switchLamp('easyMode');await switchLamp('bossAssistance');await shot('both-lights-by-choice');
    await switchLamp('easyMode');await switchLamp('bossAssistance');assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);await shot('standard-by-unlighting');
    await switchLamp('easyMode');
   }else if(setup==='guardian')await switchLamp('bossAssistance');
   assert.equal(await page.evaluate(()=>JSON.stringify({stars:G.state.stars,items:G.state.items,quests:G.questsDone})),before);
   await walkTo(12*16+8,36*16+8);await shot('continue-up-the-road');
   async function check(){assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),expected.heart);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),expected.guardian);assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()||G.ui.menuOpen),false);}
   await check();await reload();await frames(10);await check();await shot('saved-choice-without-prompt');
  }
 });
}})().catch(e=>{console.error(e);process.exitCode=1;});
