#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
(async()=>{
 for(const viewport of [{width:768,height:1024},{width:1024,height:768}])await review({out:`/tmp/patchling-title-${viewport.width}`,name:'new storybook title on tablet',publishedHost:true,modes:['touch'],viewports:{touch:viewport},
  async run({page,frames,shot}){
   await page.evaluate(()=>G.showSaveSlotScreen(true));await page.evaluate(()=>document.fonts.ready);await frames(5);
   for(const selector of ['.title-lockup','.save-slot-card','.save-screen-foot'])assert.equal(await page.locator(selector).evaluateAll(nodes=>nodes.some(el=>{const r=el.getBoundingClientRect();return r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight||el.scrollWidth>el.clientWidth;})),false,'complete '+selector+' fits the tablet');
   assert.equal(await page.title(),'Patchling’s Quest');await shot('new-title');
  }
 });
})().catch(e=>{console.error(e);process.exitCode=1;});
