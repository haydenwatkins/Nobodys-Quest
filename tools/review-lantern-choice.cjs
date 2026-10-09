#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
async function choose({page,mode,frames,pad},selector){
 if(mode==='touch'){await page.locator(selector).tap();await frames(4);return;}
 for(let i=0;i<20;i++){
  if(await page.locator(selector).evaluate(b=>b.classList.contains('controller-focus'))){await pad(0);return;}
  const a=await page.locator('#field-kit .controller-focus').boundingBox(),b=await page.locator(selector).boundingBox();assert.ok(a&&b);
  if(Math.abs(a.y-b.y)>25)await pad(a.y>b.y?12:13);else await pad(a.x>b.x?14:15);
 }
 throw Error(`TV focus cannot reach ${selector}`);
}
async function fit(page){
 const result=await page.evaluate(()=>{
  const panel=document.querySelector('.field-kit-panel'),r=panel.getBoundingClientRect();
  const fits=panel.scrollHeight<=panel.clientHeight+1&&panel.scrollWidth<=panel.clientWidth&&r.top>=0&&r.bottom<=innerHeight&&
   [...panel.querySelectorAll('button')].every(b=>{const v=b.getBoundingClientRect();return v.top>=r.top&&v.bottom<=r.bottom&&v.left>=r.left&&v.right<=r.right;});
  return {fits,scroll:panel.scrollHeight,client:panel.clientHeight,rect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},buttons:[...panel.querySelectorAll('button')].map(b=>({text:b.innerText,rect:{top:b.getBoundingClientRect().top,bottom:b.getBoundingClientRect().bottom}}))};
 });assert.equal(result.fits,true,'all choices fit without scrolling: '+JSON.stringify(result));
 const words=await page.locator('.lantern-choices').innerText();for(const text of ['Standard adventure','Both lanterns unlit.','Heart Lantern','Guardian Lantern','Longer warnings'])assert.ok(words.includes(text),text);
}
(async()=>{for(const setup of ['standard','heart','guardian']){
 const expected={heart:setup==='heart',guardian:setup==='guardian'};
 await review({url:process.argv[2]||'https://quest-review.example/',out:(process.argv[3]||'/tmp/nq-lantern-choice')+'/'+setup,name:'opening '+setup,publishedHost:true,
  ...(process.argv.includes('--tablet')?{modes:['touch'],viewports:{touch:{width:768,height:1024}}}:process.argv.includes('--small')?{modes:['touch'],viewports:{touch:{width:640,height:360}}}:{}),
  async onLanternIntro(ctx){const {page,mode,shot}=ctx;
   await shot('initial-choice-layout');await fit(page);assert.equal(await page.locator('[data-standard-adventure]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-kit-close]').innerText(),'Start standard adventure');
   if(mode==='controller')assert.ok(await page.locator('[data-kit-close]').evaluate(b=>b.classList.contains('controller-focus')));
   await shot('three-visible-choices');const before=await page.evaluate(()=>JSON.stringify({stars:G.state.stars,items:G.state.items,quests:G.questsDone,mana:G.state.player.mana}));
   if(setup==='heart'){
    // Real controls establish both lights, choose explicit standard, then Heart alone.
    await choose(ctx,'[data-lamp="easyMode"]');await choose(ctx,'[data-lamp="bossAssistance"]');assert.equal(await page.locator('[data-kit-close]').innerText(),'Start with both lanterns');
    await choose(ctx,'[data-standard-adventure]');assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')||G.comfortSetting('bossAssistance')),false);await shot('standard-after-both-lights');await choose(ctx,'[data-lamp="easyMode"]');
   }else if(setup==='guardian')await choose(ctx,'[data-lamp="bossAssistance"]');
   await fit(page);assert.equal(await page.locator('[data-kit-close]').innerText(),setup==='standard'?'Start standard adventure':setup==='heart'?'Start with Heart Lantern':'Start with Guardian Lantern');await shot('selected-start-action');
   assert.equal(await page.evaluate(()=>JSON.stringify({stars:G.state.stars,items:G.state.items,quests:G.questsDone,mana:G.state.player.mana})),before);
   await choose(ctx,'[data-kit-close]');assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()),false);
  },
  async run({page,frames,shot,reload}){
   async function check(){assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),expected.heart);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),expected.guardian);assert.ok(await page.evaluate(()=>G.state.opening.seen.includes('help-lanterns')));assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()||G.ui.menuOpen),false);}
   await check();await shot('chosen-opening');await reload();await frames(10);await check();await shot('saved-choice-after-reload');
  }
 });
}})().catch(e=>{console.error(e);process.exitCode=1;});
