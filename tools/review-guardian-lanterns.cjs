#!/usr/bin/env node
'use strict';
// Controlled chapter fixtures, native touch A / actual Android TV pad bridge.
// Reviews preparation and lamp explanations, not challenge combat or pacing.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-guardian-lanterns',name:'guardian preparation',publishedHost:true,
 async run({page,mode,frames,next,drain,shot,reload}){
  await page.evaluate(()=>{G.state.opening.complete=true;G.state.delivery.complete=true;G.state.items.push('harbor-pearl');G.state.stars=40;});
  const locations=[['orchardRoad','heartwood'],['lanternReach','tollCourt'],['shattercoast','turtleTrial'],['shattercoast','gauntletArena'],['windscarCanyon',null]];
  for(const [mapId,approach]of locations){
   await page.evaluate(({mapId,approach})=>{
    G.world.load(mapId);G.state.enemies=[];G.state.projectiles=[];
    const lamp=G.helpStations().find(s=>s.kind==='easyMode'&&(approach?s.approach===approach:!s.approach));
    if(!lamp)throw Error('missing preparation '+mapId);
    G.state.player.x=lamp.x;G.state.player.y=lamp.y;
   },{mapId,approach});await drain();await frames(10);
   for(const kind of ['easyMode','bossAssistance']){
    await page.evaluate(({kind,approach})=>{
     const lamp=G.helpStations().find(s=>s.kind===kind&&(approach?s.approach===approach:!s.approach));
     G.state.player.x=lamp.x;G.state.player.y=lamp.y;G.setComfortSetting(kind,false);
    },{kind,approach});await frames(12);
    assert.equal(await page.evaluate(()=>G.helpStationCandidate()?.kind),kind);
    const painted=await page.evaluate(()=>{
     const box=window.reviewRects.find(r=>r.color==='rgba(32, 45, 50, 0.94)'&&r.w>2);
     if(!box)throw Error('missing real world prompt');
     const lines=window.reviewPaint.filter(p=>p.x>=box.x+7&&p.x<box.x+box.w&&p.y>=box.y&&p.y<box.y+box.h);
     const c=document.getElementById('ui').getContext('2d');
     return {box,text:lines.map(p=>p.text).join(' '),fits:box.x>=0&&box.x+box.w<=G.W&&box.y>=0&&box.y+box.h<=G.H&&lines.every(p=>{c.font=p.font;return p.x+c.measureText(p.text).width<=box.x+box.w-7;})};
    });
    assert.equal(painted.fits,true,'all lamp words fit inside the real painted dock');
    assert.match(painted.text,kind==='easyMode'?/Hearts grow back, even in fights\./:/Longer warnings; help after retries\./);
    assert.ok(!painted.text.includes('…'));
    await shot(`${mapId}-${approach||'camp'}-${kind}-unlit`);
    const before=await page.evaluate(()=>JSON.stringify({items:G.state.items,stars:G.state.stars}));
    await next();assert.equal(await page.evaluate(kind=>G.comfortSetting(kind),kind),true);assert.equal(await page.evaluate(()=>G.fieldKit.isOpen()||G.ui.menuOpen||G.ui.dialogueOpen),false);
    assert.equal(await page.evaluate(()=>JSON.stringify({items:G.state.items,stars:G.state.stars})),before);
    await frames(12);await shot(`${mapId}-${approach||'camp'}-${kind}-lit`);
    await next();assert.equal(await page.evaluate(kind=>G.comfortSetting(kind),kind),false);
   }
  }
  await page.evaluate(()=>{G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',false);});await reload();
  assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),true);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),false);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
