#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-player-pace',name:'comfortable form movement',publishedHost:true,
 async run({page,mode,frames,drain,shot}){
  // Supplied earned-body checkpoint. Actual joystick/TV input, registered
  // speeds, collision terrain and costs; this does not earn the roster.
  await page.evaluate(()=>{
   Object.assign(G.state.opening,{started:true,complete:true,version:2});G.state.delivery.complete=true;
   G.state.claimedForms=G.formOrder.slice();G.state.formOutings=G.makeFormOutings();G.state.formEchoes=[];
   G.world.load('overworld');G.state.enemies=[];
  });await drain();await frames(3);
  const start=await page.evaluate(()=>{
   const s=G.state;
   for(let y=2;y<s.mapH-2;y++)for(let x=2;x<s.mapW-8;x++)
    if(Array.from({length:7},(_,i)=>s.grid[y][x+i]&&!s.grid[y][x+i].portal&&!s.grid[y][x+i].rest&&G.world.isSafeSpawn((x+i)*16+8,y*16+8)).every(Boolean))return {x:x*16+8,y:y*16+8};
  });assert.ok(start);
  for(const id of ['knight','wizard','alchemist','dragon','mole','turtle','golem','bellkeeper','colossus','rat','griffin']){
   const before=await page.evaluate(({id,start})=>{
    G.setForm(id);const p=G.state.player;Object.assign(p,start,{dir:{x:1,y:0},dashing:null,pantryHasteT:0,passiveHaste:0,slipstreamT:0});
    return {form:G.state.formId,x:p.x,speed:G.forms[id].speed,progress:JSON.stringify([G.state.stars,G.questCounts,G.questsDone,G.state.items])};
   },{id,start});await drain();await frames(2);assert.equal(before.form,id);
   if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[1,0,0,0],b:Array(16).fill(0)})));
   else{
    const rect=await page.locator('#joy-zone').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2,cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60,y}]});
    await frames(10);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
   }
   if(mode==='controller'){await frames(10);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));}
   const result=await page.evaluate(()=>({x:G.state.player.x,dialogue:G.ui.dialogueOpen,progress:JSON.stringify([G.state.stars,G.questCounts,G.questsDone,G.state.items])}));
   assert.ok(Math.abs(result.x-before.x-before.speed*.5)<.1,id+' uses its actual pace through '+mode+' controls');
   assert.equal(result.dialogue,false);assert.equal(result.progress,before.progress);
   await frames(1);if(['knight','wizard','colossus','griffin'].includes(id))await shot(id+'-walking');
  }
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
